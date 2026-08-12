import { Injectable, NotFoundException } from '@nestjs/common';
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

    const unlock = await this.prisma.userHintUnlock.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });
    const currentMaxLevel = unlock?.maxLevelUnlocked ?? 0;
    const nextLevel = currentMaxLevel + 1;

    if (nextLevel > MAX_HINT_LEVEL) {
      return {
        available: false,
        message: 'All hints for this problem have already been given.',
      };
    }

    const hint = await this.getOrGenerateHint(problem, nextLevel);

    await this.prisma.userHintUnlock.upsert({
      where: { userId_problemId: { userId, problemId } },
      create: { userId, problemId, maxLevelUnlocked: nextLevel },
      update: { maxLevelUnlocked: nextLevel },
    });

    return { level: hint.level, hintText: hint.hintText };
  }

  async listHints(userId: string, problemId: string) {
    const problem = await this.prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    const unlock = await this.prisma.userHintUnlock.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });
    const maxLevel = unlock?.maxLevelUnlocked ?? 0;

    if (maxLevel === 0) {
      return { hints: [] };
    }

    const hints = await this.prisma.hint.findMany({
      where: { problemId, level: { lte: maxLevel } },
      orderBy: { level: 'asc' },
      select: { level: true, hintText: true, generatedAt: true },
    });

    return { hints };
  }

  /** Global cache lookup by (problemId, level) — generates via Gemini only on a real cache miss. */
  private async getOrGenerateHint(problem: Problem, level: number) {
    const cached = await this.prisma.hint.findUnique({
      where: { problemId_level: { problemId: problem.id, level } },
    });
    if (cached) {
      return cached;
    }

    const hintText = await this.gemini.generateText(this.buildPrompt(problem, level));

    try {
      return await this.prisma.hint.create({
        data: { problemId: problem.id, level, hintText },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Another request generated this (problem, level) hint concurrently — use its result.
        return this.prisma.hint.findUniqueOrThrow({
          where: { problemId_level: { problemId: problem.id, level } },
        });
      }
      throw error;
    }
  }

  private buildPrompt(problem: Problem, level: number): string {
    return `You are a Data Structures & Algorithms tutor helping a learner who is stuck. Give ONLY a hint, never the full solution.

Problem: ${problem.title}
${problem.description}

This is hint level ${level} of ${MAX_HINT_LEVEL}. ${LEVEL_INSTRUCTIONS[level]}

Respond with only the hint text itself, 2-4 sentences, no preamble, no markdown headers, no code blocks unless pseudocode is explicitly appropriate for this level.`;
  }
}
