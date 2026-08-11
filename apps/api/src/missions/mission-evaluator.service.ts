import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UnlockService } from '../progression/unlock.service';
import { MissionCriteria, MissionEvaluationResult } from './mission-criteria.types';

const ACCEPTED_VERDICT = 'Accepted';

@Injectable()
export class MissionEvaluatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unlockService: UnlockService,
  ) {}

  async evaluate(userId: string, criteria: unknown): Promise<MissionEvaluationResult> {
    const parsed = criteria as MissionCriteria;

    switch (parsed.type) {
      case 'stage_stars': {
        // Reuses UnlockService.getStageStars — same star calculation already used for stage unlocking.
        const current = await this.unlockService.getStageStars(userId, parsed.stageId);
        return { satisfied: current >= parsed.minStars, current, target: parsed.minStars };
      }
      case 'solve_count': {
        const current = await this.getDistinctSolvedCount(userId);
        return { satisfied: current >= parsed.count, current, target: parsed.count };
      }
      default:
        throw new Error(`Unknown mission criteria type: ${(parsed as MissionCriteria).type}`);
    }
  }

  /** Distinct problems solved by the user, across all problems (not scoped to a stage/module). */
  private async getDistinctSolvedCount(userId: string): Promise<number> {
    const solved = await this.prisma.submission.findMany({
      where: { userId, verdict: ACCEPTED_VERDICT },
      select: { problemId: true },
      distinct: ['problemId'],
    });
    return solved.length;
  }
}
