import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressService } from './progress.service';

@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('module/:moduleId/complete')
  completeModule(
    @CurrentUser() user: CurrentUserPayload,
    @Param('moduleId') moduleId: string,
  ) {
    return this.progressService.completeModule(user.userId, moduleId);
  }
}
