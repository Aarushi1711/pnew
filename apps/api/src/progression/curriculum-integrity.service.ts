import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StageUnlockRule, TrackUnlockRule } from './unlock-rule.types';

/**
 * Startup-only sanity check (warns, never blocks) for a specific class of
 * curriculum authoring mistake: a Stage/Track displayed (via orderIndex)
 * before a Stage/Track it actually depends on via unlockRule. This is
 * distinct from the cosmetic "does the order look sensible" question --
 * it's a real logical inconsistency (a locked node's prerequisite would
 * appear later on the map than the node itself).
 */
@Injectable()
export class CurriculumIntegrityService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CurriculumIntegrityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const stageIssues = await this.checkStageOrdering();
    const trackIssues = await this.checkTrackOrdering();
    const totalIssues = stageIssues + trackIssues;

    if (totalIssues === 0) {
      this.logger.log(
        'Curriculum integrity check: all Stage and Track orderIndex values are consistent with unlockRule dependencies.',
      );
    } else {
      this.logger.warn(
        `Curriculum integrity check found ${totalIssues} ordering issue(s) -- see warnings above.`,
      );
    }
  }

  async checkStageOrdering(): Promise<number> {
    const stages = await this.prisma.stage.findMany({
      select: {
        id: true,
        trackId: true,
        orderIndex: true,
        title: true,
        unlockRule: true,
      },
    });
    const stageById = new Map(stages.map((s) => [s.id, s]));

    let issues = 0;
    for (const stage of stages) {
      const rule = stage.unlockRule as unknown as StageUnlockRule | null;
      if (!rule?.requiresStages?.length) {
        continue;
      }

      for (const requirement of rule.requiresStages) {
        const dependency = stageById.get(requirement.stageId);
        if (!dependency) {
          this.logger.warn(
            `Stage "${stage.title}" (${stage.id}) has an unlockRule referencing unknown stageId ${requirement.stageId}.`,
          );
          issues++;
          continue;
        }
        if (dependency.trackId !== stage.trackId) {
          // Cross-track dependencies aren't part of this curriculum's design;
          // display order across tracks isn't comparable, so skip.
          continue;
        }
        if (dependency.orderIndex >= stage.orderIndex) {
          this.logger.warn(
            `Stage "${stage.title}" (orderIndex ${stage.orderIndex}) depends on "${dependency.title}" ` +
              `(orderIndex ${dependency.orderIndex}) via unlockRule, but does not display after it. ` +
              `A locked stage's prerequisite should have a lower orderIndex.`,
          );
          issues++;
        }
      }
    }

    return issues;
  }

  async checkTrackOrdering(): Promise<number> {
    const tracks = await this.prisma.track.findMany({
      select: { id: true, orderIndex: true, title: true, unlockRule: true },
    });
    const trackById = new Map(tracks.map((t) => [t.id, t]));

    let issues = 0;
    for (const track of tracks) {
      const rule = track.unlockRule as unknown as TrackUnlockRule | null;
      if (!rule?.requiresTracks?.length) {
        continue;
      }

      for (const requirement of rule.requiresTracks) {
        const dependency = trackById.get(requirement.trackId);
        if (!dependency) {
          this.logger.warn(
            `Track "${track.title}" (${track.id}) has an unlockRule referencing unknown trackId ${requirement.trackId}.`,
          );
          issues++;
          continue;
        }
        if (dependency.orderIndex >= track.orderIndex) {
          this.logger.warn(
            `Track "${track.title}" (orderIndex ${track.orderIndex}) depends on "${dependency.title}" ` +
              `(orderIndex ${dependency.orderIndex}) via unlockRule, but does not display after it. ` +
              `A locked track's prerequisite should have a lower orderIndex.`,
          );
          issues++;
        }
      }
    }

    return issues;
  }
}
