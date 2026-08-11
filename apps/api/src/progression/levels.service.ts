import { Injectable, NotFoundException } from '@nestjs/common';
import { Problem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LevelChoiceDto } from './dto/level-choice.dto';
import { UnlockService } from './unlock.service';

@Injectable()
export class LevelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unlockService: UnlockService,
  ) {}

  async choose(userId: string, moduleId: string, dto: LevelChoiceDto) {
    const stageModule = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!stageModule) {
      throw new NotFoundException('Module not found');
    }

    if (dto.choice === 'practice_more') {
      return this.practiceMore(userId, stageModule.id);
    }

    return this.moveUp(userId, stageModule.stageId, stageModule.orderIndex);
  }

  private async practiceMore(userId: string, moduleId: string) {
    const unsolved = await this.unlockService.getUnsolvedProblems(userId, moduleId);
    if (unsolved.length === 0) {
      return {
        available: false,
        message: 'No more practice problems available in this module.',
      };
    }

    return { available: true, moduleId, problem: this.toProblemDto(unsolved[0]) };
  }

  private async moveUp(userId: string, stageId: string, currentOrderIndex: number) {
    const nextModule = await this.prisma.module.findFirst({
      where: { stageId, orderIndex: { gt: currentOrderIndex } },
      orderBy: { orderIndex: 'asc' },
    });

    if (!nextModule) {
      return { available: false, message: 'This is the last level in the stage.' };
    }

    const unsolved = await this.unlockService.getUnsolvedProblems(userId, nextModule.id);
    if (unsolved.length === 0) {
      return {
        available: false,
        message: 'No unsolved problems available in the next level yet.',
      };
    }

    return { available: true, moduleId: nextModule.id, problem: this.toProblemDto(unsolved[0]) };
  }

  private toProblemDto(problem: Problem) {
    return {
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      description: problem.description,
    };
  }
}
