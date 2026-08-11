import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SubmissionsService } from './submissions.service';

@UseGuards(JwtAuthGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post(':problemId')
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param('problemId') problemId: string,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.submissionsService.create(user.userId, problemId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.submissionsService.findOne(user.userId, id);
  }
}
