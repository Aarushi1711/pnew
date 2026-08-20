/**
 * Fills out the "Introduction to Arrays" module pool (Array Basics stage),
 * which was the only under-filled pool across Array Basics / Two Pointers --
 * see the audit query in this task's conversation for the full accounting.
 * Every other requested problem (Rotate Array, Valid Palindrome, Container
 * With Most Water, Remove Duplicates from Sorted Array, 3Sum) already
 * existed and was already correctly placed, so this script does not touch
 * them.
 */
import { PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

const INTRODUCTION_TO_ARRAYS_MODULE_ID = 'cmsm3cwed0004l494i8c3rbmm';

async function main() {
  const stageModule = await prisma.module.findUniqueOrThrow({
    where: { id: INTRODUCTION_TO_ARRAYS_MODULE_ID },
    include: { problems: true },
  });

  const nextOrderIndex = stageModule.problems.length + 1;

  const missingNumber = await prisma.problem.create({
    data: {
      slug: 'find-the-missing-number',
      title: 'Find the Missing Number',
      difficulty: ProblemDifficulty.EASY,
      description: `Given an array containing n distinct numbers from the range [0, n], find the one number that is missing from the range.

Example:
nums = [3,0,1]
Output: 2

Constraints:
1 <= n <= 10^4
All numbers in nums are distinct and taken from the range [0, n].`,
    },
  });

  const majorityElement = await prisma.problem.create({
    data: {
      slug: 'majority-element',
      title: 'Majority Element',
      difficulty: ProblemDifficulty.EASY,
      description: `Given an array of size n, return the majority element -- the element that appears more than n/2 times. You may assume the majority element always exists in the array.

Example:
nums = [2,2,1,1,1,2,2]
Output: 2

Constraints:
n == nums.length
1 <= n <= 5 * 10^4`,
    },
  });

  await prisma.moduleProblem.create({
    data: { moduleId: stageModule.id, problemId: missingNumber.id, orderIndex: nextOrderIndex },
  });
  await prisma.moduleProblem.create({
    data: { moduleId: stageModule.id, problemId: majorityElement.id, orderIndex: nextOrderIndex + 1 },
  });

  console.log(`Added "Find the Missing Number" and "Majority Element" to module ${stageModule.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
