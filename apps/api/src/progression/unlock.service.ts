import { Injectable } from '@nestjs/common';
import { Problem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StageUnlockRule, TrackUnlockRule } from './unlock-rule.types';

const MAX_STARS_PER_MODULE = 3;
const ACCEPTED_VERDICT = 'Accepted';

@Injectable()
export class UnlockService {
  constructor(private readonly prisma: PrismaService) {}

  /** Stars for a level (Module) = distinct problems in its pool with >=1 Accepted submission, capped at 3. */
  async getModuleStars(userId: string, moduleId: string): Promise<number> {
    const moduleProblems = await this.prisma.moduleProblem.findMany({
      where: { moduleId },
      select: { problemId: true },
    });
    if (moduleProblems.length === 0) {
      return 0;
    }

    const problemIds = moduleProblems.map((mp) => mp.problemId);
    const solved = await this.prisma.submission.findMany({
      where: {
        userId,
        problemId: { in: problemIds },
        verdict: ACCEPTED_VERDICT,
      },
      select: { problemId: true },
      distinct: ['problemId'],
    });

    return Math.min(MAX_STARS_PER_MODULE, solved.length);
  }

  /**
   * Problems in a module's pool the user has not yet solved, ordered by
   * position in the module. Unlike getModuleStars this is NOT capped at 3 —
   * a module can have unsolved bonus problems even after hitting the star cap.
   */
  async getUnsolvedProblems(
    userId: string,
    moduleId: string,
  ): Promise<Problem[]> {
    const moduleProblems = await this.prisma.moduleProblem.findMany({
      where: { moduleId },
      orderBy: { orderIndex: 'asc' },
      include: { problem: true },
    });
    if (moduleProblems.length === 0) {
      return [];
    }

    const problemIds = moduleProblems.map((mp) => mp.problemId);
    const solved = await this.prisma.submission.findMany({
      where: {
        userId,
        problemId: { in: problemIds },
        verdict: ACCEPTED_VERDICT,
      },
      select: { problemId: true },
      distinct: ['problemId'],
    });
    const solvedIds = new Set(solved.map((s) => s.problemId));

    return moduleProblems
      .filter((mp) => !solvedIds.has(mp.problemId))
      .map((mp) => mp.problem);
  }

  /** A stage's stars = sum of its modules' stars. */
  async getStageStars(userId: string, stageId: string): Promise<number> {
    const modules = await this.prisma.module.findMany({
      where: { stageId },
      select: { id: true },
    });

    const starsPerModule = await Promise.all(
      modules.map((stageModule) => this.getModuleStars(userId, stageModule.id)),
    );

    return starsPerModule.reduce((sum, stars) => sum + stars, 0);
  }

  /** Theoretical max for a stage = numModules x 3, regardless of each module's actual pool size. */
  async getStageMaxStars(stageId: string): Promise<number> {
    const moduleCount = await this.prisma.module.count({ where: { stageId } });
    return moduleCount * MAX_STARS_PER_MODULE;
  }

  /** null unlockRule = always unlocked. Otherwise ALL requiresStages entries must be satisfied. */
  async isStageUnlocked(userId: string, unlockRule: unknown): Promise<boolean> {
    if (!unlockRule) {
      return true;
    }

    const rule = unlockRule as StageUnlockRule;
    if (!rule.requiresStages || rule.requiresStages.length === 0) {
      return true;
    }

    for (const requirement of rule.requiresStages) {
      const stars = await this.getStageStars(userId, requirement.stageId);
      if (stars < requirement.minStars) {
        return false;
      }
    }

    return true;
  }

  /** A track's stars = sum of its stages' stars. */
  async getTrackStars(userId: string, trackId: string): Promise<number> {
    const stages = await this.prisma.stage.findMany({
      where: { trackId },
      select: { id: true },
    });

    const starsPerStage = await Promise.all(
      stages.map((stage) => this.getStageStars(userId, stage.id)),
    );

    return starsPerStage.reduce((sum, stars) => sum + stars, 0);
  }

  /** Theoretical max for a track = sum of its stages' max stars, computed live (never cached/hardcoded). */
  async getTrackMaxStars(trackId: string): Promise<number> {
    const stages = await this.prisma.stage.findMany({
      where: { trackId },
      select: { id: true },
    });

    const maxPerStage = await Promise.all(
      stages.map((stage) => this.getStageMaxStars(stage.id)),
    );
    return maxPerStage.reduce((sum, max) => sum + max, 0);
  }

  /**
   * null unlockRule = always unlocked. Otherwise ALL requiresTracks entries
   * must be satisfied: (real stars / real max stars) * 100 >= minPercent.
   * A dependency track with zero possible stars (no content yet) is treated
   * as vacuously 100% complete, so it can never block on divide-by-zero.
   */
  async isTrackUnlocked(userId: string, unlockRule: unknown): Promise<boolean> {
    if (!unlockRule) {
      return true;
    }

    const rule = unlockRule as TrackUnlockRule;
    if (!rule.requiresTracks || rule.requiresTracks.length === 0) {
      return true;
    }

    for (const requirement of rule.requiresTracks) {
      const [stars, maxStars] = await Promise.all([
        this.getTrackStars(userId, requirement.trackId),
        this.getTrackMaxStars(requirement.trackId),
      ]);
      const percent = maxStars === 0 ? 100 : (stars / maxStars) * 100;
      if (percent < requirement.minPercent) {
        return false;
      }
    }

    return true;
  }
}
