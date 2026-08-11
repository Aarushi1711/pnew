import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MissionEvaluatorService } from './mission-evaluator.service';

type MissionStatus = 'in_progress' | 'claimable' | 'claimed';

@Injectable()
export class MissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluator: MissionEvaluatorService,
  ) {}

  async listActive(userId: string) {
    const [missions, claims] = await Promise.all([
      this.prisma.mission.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
      this.prisma.userMissionClaim.findMany({ where: { userId } }),
    ]);
    const claimedMissionIds = new Set(claims.map((c) => c.missionId));

    const annotated = await Promise.all(
      missions.map(async (mission) => {
        const { satisfied, current, target } = await this.evaluator.evaluate(userId, mission.criteria);
        const claimed = claimedMissionIds.has(mission.id);
        const status: MissionStatus = claimed ? 'claimed' : satisfied ? 'claimable' : 'in_progress';

        return {
          id: mission.id,
          slug: mission.slug,
          title: mission.title,
          description: mission.description,
          rewardXp: mission.rewardXp,
          current,
          target,
          satisfied,
          claimed,
          status,
        };
      }),
    );

    return { missions: annotated };
  }

  async claim(userId: string, missionId: string) {
    const mission = await this.prisma.mission.findFirst({ where: { id: missionId, isActive: true } });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const existingClaim = await this.prisma.userMissionClaim.findUnique({
      where: { userId_missionId: { userId, missionId } },
    });
    if (existingClaim) {
      throw new ConflictException('Mission already claimed');
    }

    // Always re-check server-side — never trust a client claim as proof of completion.
    const { satisfied } = await this.evaluator.evaluate(userId, mission.criteria);
    if (!satisfied) {
      throw new BadRequestException('Mission criteria not yet satisfied');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        await tx.userMissionClaim.create({ data: { userId, missionId } });
        return tx.user.update({
          where: { id: userId },
          data: { totalXp: { increment: mission.rewardXp } },
          select: { totalXp: true },
        });
      });

      return { missionId, xpAwarded: mission.rewardXp, totalXp: result.totalXp };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Mission already claimed');
      }
      throw error;
    }
  }
}
