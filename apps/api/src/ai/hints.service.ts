import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Problem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from './gemini.service';

const MAX_HINT_LEVEL = 3;

const LEVEL_INSTRUCTIONS: Record<number, string> = {
  1: 'Give a general nudge toward the right approach or pattern for this problem. Do NOT name the specific technique or algorithm outright — just point the learner in the right direction.',
  2: 'Name the specific technique, pattern, or algorithm that should be used to solve this problem (for example "two pointers", "dynamic programming", "hash map"), and briefly explain why it applies. Do not describe the implementation steps yet.',
  3: 'Give a near-pseudocode-level hint: describe the key steps of the algorithm in plain language or loose pseudocode, detailed enough to guide implementation. Do NOT provide full working code in any programming language.',
};

@Injectable()
export class HintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  async requestHint(userId: string, problemId: string) {
    const problem = await this.prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    const existingCount = await this.prisma.hintRequest.count({ where: { userId, problemId } });
    const nextLevel = existingCount + 1;

    if (nextLevel > MAX_HINT_LEVEL) {
      return {
        available: false,
        message: 'All hints for this problem have already been given.',
      };
    }

    const hintText = await this.gemini.generateText(this.buildPrompt(problem, nextLevel));

    try {
      await this.prisma.hintRequest.create({
        data: { userId, problemId, level: nextLevel, hintText },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This hint level was already generated for this problem.');
      }
      throw error;
    }

    return { level: nextLevel, hintText };
  }

  async listHints(userId: string, problemId: string) {
    const problem = await this.prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    const hints = await this.prisma.hintRequest.findMany({
      where: { userId, problemId },
      orderBy: { level: 'asc' },
      select: { level: true, hintText: true, createdAt: true },
    });

    return { hints };
  }

  private buildPrompt(problem: Problem, level: number): string {
    return `You are a Data Structures & Algorithms tutor helping a learner who is stuck. Give ONLY a hint, never the full solution.

Problem: ${problem.title}
${problem.description}

This is hint level ${level} of ${MAX_HINT_LEVEL}. ${LEVEL_INSTRUCTIONS[level]}

Respond with only the hint text itself, 2-4 sentences, no preamble, no markdown headers, no code blocks unless pseudocode is explicitly appropriate for this level.`;
  }
}
