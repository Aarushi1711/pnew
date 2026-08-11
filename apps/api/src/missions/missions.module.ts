import { Module } from '@nestjs/common';
import { ProgressionModule } from '../progression/progression.module';
import { MissionEvaluatorService } from './mission-evaluator.service';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';

@Module({
  imports: [ProgressionModule],
  controllers: [MissionsController],
  providers: [MissionEvaluatorService, MissionsService],
})
export class MissionsModule {}
