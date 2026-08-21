/**
 * Adds a new "Prefix Sum" stage to the Arrays track, positioned at
 * orderIndex 4 (after Sliding Window), pushing the existing
 * "Arrays + Two Pointers Mix" combo stage to orderIndex 5 -- same
 * temp-value swap pattern used for the Sliding Window reorder, since Stage
 * has @@unique([trackId, orderIndex]).
 *
 * Unlock rule: 50% of Sliding Window's real max stars, computed live below
 * (moduleCount * 3, the same formula UnlockService.getStageMaxStars uses),
 * not hardcoded.
 *
 * Audited first: no existing Problem matches the prefix-sum pattern (see
 * the audit query in this task's conversation) -- the one keyword hit,
 * "Minimum Size Subarray Sum", is a sliding-window minimal-length problem,
 * not a prefix-sum exact-count problem, so it's not a duplicate.
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;
const COMBO_STAGE_ID = 'cmsoxuw2i000nl4z8ou0f3bl8';
const TEMP_ORDER_INDEX = 999;

async function main() {
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: 'arrays' } });
  const slidingWindow = await prisma.stage.findFirstOrThrow({
    where: { trackId: track.id, title: 'Sliding Window' },
  });

  const slidingWindowModuleCount = await prisma.module.count({ where: { stageId: slidingWindow.id } });
  const slidingWindowMaxStars = slidingWindowModuleCount * MAX_STARS_PER_MODULE;
  const minStars = slidingWindowMaxStars * 0.5;
  console.log(
    `Sliding Window: ${slidingWindowModuleCount} modules -> max ${slidingWindowMaxStars} stars -> 50% = ${minStars}`,
  );

  // Make room at orderIndex 4 by moving the combo stage to 5 first (via a
  // temp value, since orderIndex 4 doesn't exist yet at this point anyway --
  // no actual collision here, but kept consistent/safe with the same
  // pattern used for the Sliding Window reorder).
  await prisma.$transaction([
    prisma.stage.update({ where: { id: COMBO_STAGE_ID }, data: { orderIndex: TEMP_ORDER_INDEX } }),
    prisma.stage.update({ where: { id: COMBO_STAGE_ID }, data: { orderIndex: 5 } }),
  ]);

  const stage = await prisma.stage.create({
    data: {
      trackId: track.id,
      orderIndex: 4,
      title: 'Prefix Sum',
      unlockRule: { requiresStages: [{ stageId: slidingWindow.id, minStars }] },
    },
  });

  const basics = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 1,
      title: 'Prefix Sum Basics',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const problems = [
    {
      slug: 'range-sum-query-immutable',
      title: 'Range Sum Query - Immutable',
      difficulty: ProblemDifficulty.EASY,
      description: `Given an integer array, handle multiple queries for the sum of elements between indices i and j (inclusive), efficiently.

Example:
nums = [-2,0,3,-5,2,-1]
sumRange(0,2) -> 1
sumRange(2,5) -> -1

Constraints:
1 <= nums.length <= 10^4
Up to 10^4 calls to sumRange`,
    },
    {
      slug: 'find-pivot-index',
      title: 'Find Pivot Index',
      difficulty: ProblemDifficulty.EASY,
      description: `Given an array of integers, return the leftmost pivot index -- the index where the sum of all elements to the left equals the sum of all elements to the right. Return -1 if no such index exists.

Example:
nums = [1,7,3,6,5,6]
Output: 3

Constraints:
1 <= nums.length <= 10^4`,
    },
    {
      slug: 'subarray-sum-equals-k',
      title: 'Subarray Sum Equals K',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given an array of integers and an integer k, return the total number of contiguous subarrays whose sum equals k.

Example:
nums = [1,1,1], k = 2
Output: 2

Constraints:
1 <= nums.length <= 2 * 10^4
-1000 <= k <= 1000`,
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
