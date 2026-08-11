/**
 * One-off seed script for the stage-unlocking demo.
 * Assumes the base seed (prisma/seed.ts) has already run.
 * Run with: npx ts-node --compiler-options {"module":"commonjs"} prisma/seed-unlock-demo.ts
 */
import { ModuleContentType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createModuleWithProblems(
  stageId: string,
  orderIndex: number,
  title: string,
  problems: { slug: string; title: string; description: string }[],
) {
  const stageModule = await prisma.module.create({
    data: { stageId, orderIndex, title, contentType: ModuleContentType.PROBLEM_SET },
  });

  const createdProblems = await Promise.all(
    problems.map((p) => prisma.problem.create({ data: p })),
  );

  await Promise.all(
    createdProblems.map((problem, i) =>
      prisma.moduleProblem.create({
        data: { moduleId: stageModule.id, problemId: problem.id, orderIndex: i + 1 },
      }),
    ),
  );

  return stageModule;
}

async function main() {
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: 'arrays' } });
  const arrayBasics = await prisma.stage.findFirstOrThrow({
    where: { trackId: track.id, orderIndex: 1 },
  });

  // Give Array Basics two more modules (on top of the existing "Introduction to
  // Arrays") so it has enough real headroom to reach 6+ stars for the combo stage.
  await createModuleWithProblems(arrayBasics.id, 2, 'Array Fundamentals II', [
    {
      slug: 'contains-duplicate',
      title: 'Contains Duplicate',
      description: 'Given an integer array, determine if any value appears at least twice.',
    },
    {
      slug: 'best-time-to-buy-and-sell-stock',
      title: 'Best Time to Buy and Sell Stock',
      description: 'Find the maximum profit from a single buy/sell of a stock given daily prices.',
    },
    {
      slug: 'maximum-subarray',
      title: 'Maximum Subarray',
      description: 'Find the contiguous subarray with the largest sum.',
    },
  ]);

  await createModuleWithProblems(arrayBasics.id, 3, 'Array Fundamentals III', [
    {
      slug: 'move-zeroes',
      title: 'Move Zeroes',
      description: 'Move all zeroes in an array to the end while keeping relative order of non-zero elements.',
    },
    {
      slug: 'product-of-array-except-self',
      title: 'Product of Array Except Self',
      description: 'Return an array where each element is the product of all other elements.',
    },
    {
      slug: 'rotate-array',
      title: 'Rotate Array',
      description: 'Rotate an array to the right by k steps.',
    },
  ]);

  // New "Two Pointers" stage, two modules deep so it can reach 6+ stars too.
  const twoPointers = await prisma.stage.create({
    data: { trackId: track.id, orderIndex: 2, title: 'Two Pointers' },
  });

  await createModuleWithProblems(twoPointers.id, 1, 'Two Pointers Basics', [
    {
      slug: 'valid-palindrome',
      title: 'Valid Palindrome',
      description: 'Determine if a string is a palindrome, considering only alphanumeric characters.',
    },
    {
      slug: 'container-with-most-water',
      title: 'Container With Most Water',
      description: 'Find two lines that together with the x-axis form the container holding the most water.',
    },
    {
      slug: 'remove-duplicates-from-sorted-array',
      title: 'Remove Duplicates from Sorted Array',
      description: 'Remove duplicates in-place from a sorted array and return the new length.',
    },
  ]);

  await createModuleWithProblems(twoPointers.id, 2, 'Two Pointers Advanced', [
    {
      slug: 'three-sum',
      title: '3Sum',
      description: 'Find all unique triplets in the array that sum to zero.',
    },
    {
      slug: 'trapping-rain-water',
      title: 'Trapping Rain Water',
      description: 'Compute how much water can be trapped after raining, given elevation heights.',
    },
    {
      slug: 'sort-colors',
      title: 'Sort Colors',
      description: 'Sort an array of 0s, 1s, and 2s in-place (Dutch national flag problem).',
    },
  ]);

  // --- Auto-populate unlockRule for regular stages after the first in each track ---
  // (Runs before the combo stage below exists, so the combo stage is never touched here.)
  const allTracks = await prisma.track.findMany({
    include: { stages: { orderBy: { orderIndex: 'asc' } } },
  });

  for (const t of allTracks) {
    for (let i = 1; i < t.stages.length; i++) {
      const stage = t.stages[i];
      const prevStage = t.stages[i - 1];
      const moduleCount = await prisma.module.count({ where: { stageId: prevStage.id } });
      const maxStars = moduleCount * 3;
      const minStars = Math.round(maxStars * 0.5);

      await prisma.stage.update({
        where: { id: stage.id },
        data: { unlockRule: { requiresStages: [{ stageId: prevStage.id, minStars }] } },
      });

      console.log(
        `Auto-populated unlockRule for stage "${stage.title}": requires ${minStars} stars in "${prevStage.title}" (its max is ${maxStars}).`,
      );
    }
  }

  // --- Combo stage: proves multi-prerequisite unlocking, not just sequential ---
  const comboStage = await prisma.stage.create({
    data: {
      trackId: track.id,
      orderIndex: 3,
      title: 'Arrays + Two Pointers Mix',
      unlockRule: {
        requiresStages: [
          { stageId: arrayBasics.id, minStars: 6 },
          { stageId: twoPointers.id, minStars: 6 },
        ],
      },
    },
  });

  console.log('Seeded stage-unlocking demo content:');
  console.log({ arrayBasicsId: arrayBasics.id, twoPointersId: twoPointers.id, comboStageId: comboStage.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
