import { Injectable, NotFoundException } from '@nestjs/common';
import { ProgressStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async completeModule(userId: string, moduleId: string) {
    const stageModule = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });
    if (!stageModule) {
      throw new NotFoundException('Module not found');
    }

    return this.prisma.userModuleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      create: { userId, moduleId, status: ProgressStatus.COMPLETED },
      update: { status: ProgressStatus.COMPLETED },
    });
  }
}
