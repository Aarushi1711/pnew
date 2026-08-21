/**
 * Adds a new "Binary Search on Arrays" stage to the Arrays track, at
 * orderIndex 5 (after Prefix Sum), pushing the existing
 * "Arrays + Two Pointers Mix" combo stage to orderIndex 6 -- same
 * temp-value swap pattern used for the previous two additions.
 *
 * Unlock rule: 50% of Prefix Sum's real max stars, computed live below.
 * Prefix Sum has only 1 module (max 3 stars), so 50% = 1.5 -- not a whole
 * number. Rounded up (ceil) to match the established precedent: Two
 * Pointers' own real rule is 50% of Array Basics' 9 max = 4.5, stored as 5.
 *
 * Audited first: no existing Problem matches the binary-search pattern (see
 * the audit query in this task's conversation) -- the keyword hits were all
 * unrelated problems (hashmap two-sum, two-pointer dedup, sliding window).
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;
const COMBO_STAGE_ID = 'cmsoxuw2i000nl4z8ou0f3bl8';
const TEMP_ORDER_INDEX = 999;

async function main() {
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: 'arrays' } });
  const prefixSum = await prisma.stage.findFirstOrThrow({
    where: { trackId: track.id, title: 'Prefix Sum' },
  });

  const prefixSumModuleCount = await prisma.module.count({ where: { stageId: prefixSum.id } });
  const prefixSumMaxStars = prefixSumModuleCount * MAX_STARS_PER_MODULE;
  const rawFiftyPercent = prefixSumMaxStars * 0.5;
  const minStars = Math.ceil(rawFiftyPercent);
  console.log(
    `Prefix Sum: ${prefixSumModuleCount} module(s) -> max ${prefixSumMaxStars} stars -> 50% = ${rawFiftyPercent} -> ceil = ${minStars}`,
  );

  await prisma.$transaction([
    prisma.stage.update({ where: { id: COMBO_STAGE_ID }, data: { orderIndex: TEMP_ORDER_INDEX } }),
    prisma.stage.update({ where: { id: COMBO_STAGE_ID }, data: { orderIndex: 6 } }),
  ]);

  const stage = await prisma.stage.create({
    data: {
      trackId: track.id,
      orderIndex: 5,
      title: 'Binary Search on Arrays',
      unlockRule: { requiresStages: [{ stageId: prefixSum.id, minStars }] },
    },
  });

  const basics = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 1,
      title: 'Binary Search Basics',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const problems = [
    {
      slug: 'binary-search',
      title: 'Binary Search',
      difficulty: ProblemDifficulty.EASY,
      description: `Given a sorted array of integers and a target value, return the index of the target if it exists, or -1 if it does not. Your solution must run in O(log n) time.

Example:
nums = [-1,0,3,5,9,12], target = 9
Output: 4

Constraints:
1 <= nums.length <= 10^4
All values in nums are unique and sorted in ascending order.`,
    },
    {
      slug: 'search-insert-position',
      title: 'Search Insert Position',
      difficulty: ProblemDifficulty.EASY,
      description: `Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be inserted to keep the array sorted.

Example:
nums = [1,3,5,6], target = 5
Output: 2

nums = [1,3,5,6], target = 2
Output: 1

Constraints:
1 <= nums.length <= 10^4
Your solution must run in O(log n) time.`,
    },
    {
      slug: 'find-first-and-last-position-of-element-in-sorted-array',
      title: 'Find First and Last Position of Element in Sorted Array',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given a sorted array of integers and a target value, find the starting and ending position of the target's occurrences. Return [-1,-1] if the target is not found. Your solution must run in O(log n) time.

Example:
nums = [5,7,7,8,8,10], target = 8
Output: [3,4]

Constraints:
0 <= nums.length <= 10^5`,
    },
  ];

  for (const [i, data] of problems.entries()) {
    const problem = await prisma.problem.create({ data });
    await prisma.moduleProblem.create({
      data: { moduleId: basics.id, problemId: problem.id, orderIndex: i + 1 },
    });
  }

  console.log(`Created stage "${stage.title}" (${stage.id}) with module ${basics.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
