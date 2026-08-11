import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HintsService } from './hints.service';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class HintsController {
  constructor(private readonly hintsService: HintsService) {}

  @Post('hint/:problemId')
  requestHint(@CurrentUser() user: CurrentUserPayload, @Param('problemId') problemId: string) {
    return this.hintsService.requestHint(user.userId, problemId);
  }

  @Get('hints/:problemId')
  listHints(@CurrentUser() user: CurrentUserPayload, @Param('problemId') problemId: string) {
    return this.hintsService.listHints(user.userId, problemId);
  }
}
