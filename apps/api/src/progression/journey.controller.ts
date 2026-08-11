import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JourneyService } from './journey.service';

@UseGuards(JwtAuthGuard)
@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Get('map')
  getMap(@CurrentUser() user: CurrentUserPayload) {
    return this.journeyService.getMap(user.userId);
  }
}
