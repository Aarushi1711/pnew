/**
 * Adds a new "Kadane's & Subarray Problems" stage to the Arrays track, at
 * orderIndex 6 (after Binary Search on Arrays), pushing the existing
 * "Arrays + Two Pointers Mix" combo stage to orderIndex 7 -- same
 * temp-value swap pattern used for the previous three additions.
 *
 * Unlock rule: 50% of Binary Search's real max stars, computed live below.
 * Binary Search has 1 module (max 3 stars) -> 50% = 1.5 -> ceil = 2, same
 * ceil-rounding convention established for Two Pointers' and Binary
 * Search's own rules.
 *
 * Audited first: two of the three requested problems already exist --
 * "Maximum Subarray" and "Best Time to Buy and Sell Stock" are both
 * correctly-titled, correctly-described, and already live in
 * "Array Fundamentals II" (Array Basics stage). Per the established
 * no-duplicate discipline, this script does NOT create new Problem rows
 * for them -- it links the SAME existing Problem records into this new
 * module's pool (ModuleProblem is a many-to-many join, so a Problem can
 * belong to more than one Module without duplication). Only
 * "Maximum Product Subarray" is a genuinely new Problem.
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;
const COMBO_STAGE_ID = 'cmsoxuw2i000nl4z8ou0f3bl8';
const TEMP_ORDER_INDEX = 999;

async function main() {
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: 'arrays' } });
  const binarySearch = await prisma.stage.findFirstOrThrow({
    where: { trackId: track.id, title: 'Binary Search on Arrays' },
  });

  const binarySearchModuleCount = await prisma.module.count({ where: { stageId: binarySearch.id } });
  const binarySearchMaxStars = binarySearchModuleCount * MAX_STARS_PER_MODULE;
  const rawFiftyPercent = binarySearchMaxStars * 0.5;
  const minStars = Math.ceil(rawFiftyPercent);
  console.log(
    `Binary Search: ${binarySearchModuleCount} module(s) -> max ${binarySearchMaxStars} stars -> 50% = ${rawFiftyPercent} -> ceil = ${minStars}`,
  );

  const maximumSubarray = await prisma.problem.findUniqueOrThrow({ where: { slug: 'maximum-subarray' } });
  const bestTimeToBuySell = await prisma.problem.findUniqueOrThrow({
    where: { slug: 'best-time-to-buy-and-sell-stock' },
  });

  await prisma.$transaction([
    prisma.stage.update({ where: { id: COMBO_STAGE_ID }, data: { orderIndex: TEMP_ORDER_INDEX } }),
    prisma.stage.update({ where: { id: COMBO_STAGE_ID }, data: { orderIndex: 7 } }),
  ]);

  const stage = await prisma.stage.create({
    data: {
      trackId: track.id,
      orderIndex: 6,
      title: "Kadane's & Subarray Problems",
      unlockRule: { requiresStages: [{ stageId: binarySearch.id, minStars }] },
    },
  });

  const kadane = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 1,
      title: "Kadane's Algorithm",
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const maximumProductSubarray = await prisma.problem.create({
    data: {
      slug: 'maximum-product-subarray',
      title: 'Maximum Product Subarray',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given an integer array, find a contiguous subarray that has the largest product, and return that product.

Example:
nums = [2,3,-2,4]
Output: 6 (subarray [2,3])

Constraints:
1 <= nums.length <= 2 * 10^4
nums may contain negative numbers and zeros.`,
    },
  });

  await prisma.moduleProblem.create({
    data: { moduleId: kadane.id, problemId: maximumSubarray.id, orderIndex: 1 },
  });
  await prisma.moduleProblem.create({
    data: { moduleId: kadane.id, problemId: maximumProductSubarray.id, orderIndex: 2 },
  });
  await prisma.moduleProblem.create({
    data: { moduleId: kadane.id, problemId: bestTimeToBuySell.id, orderIndex: 3 },
  });

  console.log(`Created stage "${stage.title}" (${stage.id}) with module ${kadane.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
