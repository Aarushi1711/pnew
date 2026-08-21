/**
 * Adds a new "Sliding Window" stage to the Arrays track, positioned after
 * the existing "Arrays + Two Pointers Mix" combo stage in orderIndex (4) so
 * the combo stage's own position/unlockRule stay untouched, exactly as
 * instructed. Its unlock condition still only depends on Two Pointers
 * (minStars: 3 == 50% of Two Pointers' real max of 6 stars, computed live
 * below via the same moduleCount * 3 formula UnlockService.getStageMaxStars
 * uses -- not hardcoded), so it behaves as "the next stage after Two
 * Pointers" in the actual unlock chain.
 *
 * Audited first: no existing Problem matches these sliding-window patterns
 * (see the audit query in this task's conversation), so all 6 problems
 * below are genuinely new.
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;

async function main() {
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: 'arrays' } });
  const twoPointers = await prisma.stage.findFirstOrThrow({
    where: { trackId: track.id, title: 'Two Pointers' },
  });

  const twoPointersModuleCount = await prisma.module.count({ where: { stageId: twoPointers.id } });
  const twoPointersMaxStars = twoPointersModuleCount * MAX_STARS_PER_MODULE;
  const minStars = twoPointersMaxStars * 0.5;
  console.log(
    `Two Pointers: ${twoPointersModuleCount} modules -> max ${twoPointersMaxStars} stars -> 50% = ${minStars}`,
  );

  const stage = await prisma.stage.create({
    data: {
      trackId: track.id,
      orderIndex: 4,
      title: 'Sliding Window',
      unlockRule: { requiresStages: [{ stageId: twoPointers.id, minStars }] },
    },
  });

  const basics = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 1,
      title: 'Sliding Window Basics',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const advanced = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 2,
      title: 'Sliding Window Advanced',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const fixedSizeProblems = [
    {
      slug: 'maximum-sum-subarray-of-size-k',
      title: 'Maximum Sum Subarray of Size K',
      difficulty: ProblemDifficulty.EASY,
      description: `Given an array of integers and an integer k, find the maximum sum of any contiguous subarray of exactly size k.

Example:
nums = [2,1,5,1,3,2], k = 3
Output: 9 (subarray [5,1,3])

Constraints:
1 <= k <= nums.length <= 10^5`,
    },
    {
      slug: 'average-of-subarrays-of-size-k',
      title: 'Average of Subarrays of Size K',
      difficulty: ProblemDifficulty.EASY,
      description: `Given an array and an integer k, return the average of every contiguous subarray of size k.

Example:
nums = [1,3,2,6,-1,4,1,8,2], k = 5
Output: [2.2, 2.8, 2.4, 3.6, 2.8]

Constraints:
1 <= k <= nums.length <= 10^5`,
    },
    {
      slug: 'maximum-number-of-vowels-in-a-substring-of-length-k',
      title: 'Maximum Number of Vowels in a Substring of Length K',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given a string s and an integer k, return the maximum number of vowel letters in any substring of s with length k.

Example:
s = "abciiidef", k = 3
Output: 3

Constraints:
1 <= s.length <= 10^5
1 <= k <= s.length`,
    },
  ];

  const variableSizeProblems = [
    {
      slug: 'longest-substring-without-repeating-characters',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given a string, find the length of the longest substring without repeating characters.

Example:
s = "abcabcbb"
Output: 3 ("abc")

Constraints:
0 <= s.length <= 5 * 10^4`,
    },
    {
      slug: 'minimum-size-subarray-sum',
      title: 'Minimum Size Subarray Sum',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given an array of positive integers and a target sum, find the minimal length of a contiguous subarray whose sum is greater than or equal to target. Return 0 if no such subarray exists.

Example:
target = 7, nums = [2,3,1,2,4,3]
Output: 2 (subarray [4,3])

Constraints:
1 <= target <= 10^9
1 <= nums.length <= 10^5`,
    },
    {
      slug: 'longest-substring-with-at-most-two-distinct-characters',
      title: 'Longest Substring with At Most Two Distinct Characters',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given a string, find the length of the longest substring that contains at most two distinct characters.

Example:
s = "eceba"
Output: 3 ("ece")

Constraints:
1 <= s.length <= 10^5`,
    },
  ];

  for (const [i, data] of fixedSizeProblems.entries()) {
    const problem = await prisma.problem.create({ data });
    await prisma.moduleProblem.create({
      data: { moduleId: basics.id, problemId: problem.id, orderIndex: i + 1 },
    });
  }

  for (const [i, data] of variableSizeProblems.entries()) {
    const problem = await prisma.problem.create({ data });
    await prisma.moduleProblem.create({
      data: { moduleId: advanced.id, problemId: problem.id, orderIndex: i + 1 },
    });
  }

  console.log(`Created stage "${stage.title}" (${stage.id}) with modules ${basics.id} and ${advanced.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
