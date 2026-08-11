import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MissionsService } from './missions.service';

@UseGuards(JwtAuthGuard)
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.missionsService.listActive(user.userId);
  }

  @Post(':missionId/claim')
  claim(@CurrentUser() user: CurrentUserPayload, @Param('missionId') missionId: string) {
    return this.missionsService.claim(user.userId, missionId);
  }
}
