/**
 * TEMPORARY MOCK — this service fakes grading instead of calling a real
 * code execution sandbox. Replace with a real Judge0 (or equivalent) call
 * when self-hosting is unblocked. The Submission model, statuses, and
 * verdict shape are already designed to survive that swap unchanged.
 */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

const MOCK_GRADING_DELAY_MS_MIN = 1000;
const MOCK_GRADING_DELAY_MS_MAX = 2500;
const MOCK_VERDICTS = ['Accepted', 'Wrong Answer'] as const;

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, problemId: string, dto: CreateSubmissionDto) {
    const problem = await this.prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    const submission = await this.prisma.submission.create({
      data: {
        userId,
        problemId,
        language: dto.language,
        sourceCode: dto.sourceCode,
        status: SubmissionStatus.QUEUED,
        isMock: true,
      },
    });

    this.scheduleMockGrading(submission.id);

    return submission;
  }

  async findOne(userId: string, id: string) {
    const submission = await this.prisma.submission.findUnique({ where: { id } });
    if (!submission || submission.userId !== userId) {
      throw new NotFoundException('Submission not found');
    }
    return submission;
  }

  /** TEMPORARY MOCK — fires a delayed fake verdict instead of enqueuing a real judge job. */
  private scheduleMockGrading(submissionId: string) {
    const delay =
      MOCK_GRADING_DELAY_MS_MIN +
      Math.random() * (MOCK_GRADING_DELAY_MS_MAX - MOCK_GRADING_DELAY_MS_MIN);

    setTimeout(() => {
      const verdict = MOCK_VERDICTS[Math.floor(Math.random() * MOCK_VERDICTS.length)];
      const runtimeMs = Math.floor(10 + Math.random() * 490);
      const memoryKb = Math.floor(2000 + Math.random() * 13000);

      this.prisma.submission
        .update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.GRADED,
            verdict,
            runtimeMs,
            memoryKb,
          },
        })
        .catch((error) => {
          this.logger.error(`Mock grading failed to persist for submission ${submissionId}`, error);
        });
    }, delay);
  }
}
