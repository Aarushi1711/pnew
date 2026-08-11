import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StageUnlockRule } from './unlock-rule.types';

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
      where: { userId, problemId: { in: problemIds }, verdict: ACCEPTED_VERDICT },
      select: { problemId: true },
      distinct: ['problemId'],
    });

    return Math.min(MAX_STARS_PER_MODULE, solved.length);
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
}
