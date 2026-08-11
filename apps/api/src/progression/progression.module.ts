import { Module } from '@nestjs/common';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';
import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UnlockService } from './unlock.service';

@Module({
  controllers: [JourneyController, ProgressController, LevelsController],
  providers: [JourneyService, ProgressService, UnlockService, LevelsService],
  exports: [UnlockService],
})
export class ProgressionModule {}
