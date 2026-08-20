import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('problems')
export class ProblemsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, description: true },
    });

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    return problem;
  }
}
