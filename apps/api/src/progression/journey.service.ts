import { Injectable } from '@nestjs/common';
import { ProgressStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UnlockService } from './unlock.service';

@Injectable()
export class JourneyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unlockService: UnlockService,
  ) {}

  async getMap(userId: string) {
    const [tracks, trackProgress, stageProgress, moduleProgress] = await Promise.all([
      this.prisma.track.findMany({
        orderBy: { orderIndex: 'asc' },
        include: {
          stages: {
            orderBy: { orderIndex: 'asc' },
            include: {
              modules: {
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      }),
      this.prisma.userTrackProgress.findMany({ where: { userId } }),
      this.prisma.userStageProgress.findMany({ where: { userId } }),
      this.prisma.userModuleProgress.findMany({ where: { userId } }),
    ]);

    const trackStatusById = new Map(trackProgress.map((p) => [p.trackId, p.status]));
    const stageStatusById = new Map(stageProgress.map((p) => [p.stageId, p.status]));
    const moduleStatusById = new Map(moduleProgress.map((p) => [p.moduleId, p.status]));

    const tracksWithLocking = await Promise.all(
      tracks.map(async (track) => ({
        id: track.id,
        slug: track.slug,
        title: track.title,
        orderIndex: track.orderIndex,
        description: track.description,
        status: trackStatusById.get(track.id) ?? ProgressStatus.NOT_STARTED,
        stages: await Promise.all(
          track.stages.map(async (stage) => ({
            id: stage.id,
            orderIndex: stage.orderIndex,
            title: stage.title,
            unlockRule: stage.unlockRule,
            locked: !(await this.unlockService.isStageUnlocked(userId, stage.unlockRule)),
            status: stageStatusById.get(stage.id) ?? ProgressStatus.NOT_STARTED,
            modules: await Promise.all(
              stage.modules.map(async (stageModule) => {
                const [starsEarned, unsolvedProblems] = await Promise.all([
                  this.unlockService.getModuleStars(userId, stageModule.id),
                  this.unlockService.getUnsolvedProblems(userId, stageModule.id),
                ]);

                return {
                  id: stageModule.id,
                  orderIndex: stageModule.orderIndex,
                  title: stageModule.title,
                  contentType: stageModule.contentType,
                  status: moduleStatusById.get(stageModule.id) ?? ProgressStatus.NOT_STARTED,
                  starsEarned,
                  hasMorePractice: unsolvedProblems.length > 0,
                };
              }),
            ),
          })),
        ),
      })),
    );

    return { tracks: tracksWithLocking };
  }
}
