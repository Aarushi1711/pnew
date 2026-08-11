import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { HintsController } from './hints.controller';
import { HintsService } from './hints.service';

@Module({
  controllers: [HintsController],
  providers: [GeminiService, HintsService],
})
export class AiModule {}
