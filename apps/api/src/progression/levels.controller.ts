import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LevelChoiceDto } from './dto/level-choice.dto';
import { LevelsService } from './levels.service';

@UseGuards(JwtAuthGuard)
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Post(':moduleId/choice')
  choose(
    @CurrentUser() user: CurrentUserPayload,
    @Param('moduleId') moduleId: string,
    @Body() dto: LevelChoiceDto,
  ) {
    return this.levelsService.choose(user.userId, moduleId, dto);
  }
}
