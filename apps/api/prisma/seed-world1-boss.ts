/**
 * Adds the final Stage in World 1's Arrays track: "World 1 Boss Challenge",
 * at orderIndex 9 -- after the combo stage, which stays at orderIndex 8
 * untouched (no swap this time, unlike every previous addition).
 *
 * Unlock rule: real multi-prerequisite gate across all 7 prior stages.
 * Six of the seven requested thresholds (Array Basics 6, Sliding Window 4,
 * Prefix Sum 2, Binary Search 2, Kadane's 2, String Manipulation 2) exactly
 * match ceil(2/3 * that stage's real max stars) -- computed live below.
 * The seventh (Two Pointers) was requested as 6, but Two Pointers' real max
 * is only 6, so 6 would be 100% of it, not the ~65% every other threshold
 * lands on and not within the stated 50-65% range. Confirmed with the user:
 * using 4 (= ceil(2/3 * 6)) instead, consistent with the other six.
 *
 * Audited first: "Trapping Rain Water" already exists (Two Pointers
 * Advanced) -- not duplicated; the same Problem record is linked into this
 * new module instead (ModuleProblem is a many-to-many join), and its
 * difficulty is backfilled to HARD since the task explicitly states it this
 * time (not a guess). "Sliding Window Maximum" and "Longest Consecutive
 * Sequence" are genuinely new.
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;

async function maxStarsFor(trackId: string, title: string) {
  const stage = await prisma.stage.findFirstOrThrow({ where: { trackId, title } });
  const moduleCount = await prisma.module.count({ where: { stageId: stage.id } });
  return { stage, maxStars: moduleCount * MAX_STARS_PER_MODULE };
}

async function main() {
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: 'arrays' } });

  const stageNames = [
    'Array Basics',
    'Two Pointers',
    'Sliding Window',
    'Prefix Sum',
    'Binary Search on Arrays',
    "Kadane's & Subarray Problems",
    'String Manipulation Basics',
  ];

  const requirements: { stageId: string; minStars: number }[] = [];
  for (const name of stageNames) {
    const { stage, maxStars } = await maxStarsFor(track.id, name);
    const rawTwoThirds = maxStars * (2 / 3);
    const minStars = Math.ceil(rawTwoThirds);
    console.log(`${name}: maxStars=${maxStars} -> 2/3 = ${rawTwoThirds.toFixed(2)} -> ceil = ${minStars}`);
    requirements.push({ stageId: stage.id, minStars });
  }

  const stage = await prisma.stage.create({
    data: {
      trackId: track.id,
      orderIndex: 9,
      title: 'World 1 Boss Challenge',
      unlockRule: { requiresStages: requirements },
    },
  });

  const gauntlet = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 1,
      title: 'The Gauntlet',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const trappingRainWater = await prisma.problem.update({
    where: { slug: 'trapping-rain-water' },
    data: { difficulty: ProblemDifficulty.HARD },
  });

  const slidingWindowMaximum = await prisma.problem.create({
    data: {
      slug: 'sliding-window-maximum',
      title: 'Sliding Window Maximum',
      difficulty: ProblemDifficulty.HARD,
      description: `Given an array of integers and a sliding window of size k moving from the left of the array to the right, return the maximum value in the window at each position.

Example:
nums = [1,3,-1,-3,5,3,6,7], k = 3
Output: [3,3,5,5,6,7]

Constraints:
1 <= nums.length <= 10^5
1 <= k <= nums.length
Your solution should run in O(n) time.`,
    },
  });

  const longestConsecutiveSequence = await prisma.problem.create({
    data: {
      slug: 'longest-consecutive-sequence',
      title: 'Longest Consecutive Sequence',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given an unsorted array of integers, find the length of the longest consecutive elements sequence. Your algorithm must run in O(n) time.

Example:
nums = [100,4,200,1,3,2]
Output: 4 (the sequence [1,2,3,4])

Constraints:
0 <= nums.length <= 10^5`,
    },
  });

  await prisma.moduleProblem.create({
    data: { moduleId: gauntlet.id, problemId: trappingRainWater.id, orderIndex: 1 },
  });
  await prisma.moduleProblem.create({
    data: { moduleId: gauntlet.id, problemId: slidingWindowMaximum.id, orderIndex: 2 },
  });
  await prisma.moduleProblem.create({
    data: { moduleId: gauntlet.id, problemId: longestConsecutiveSequence.id, orderIndex: 3 },
  });

  console.log(`Created stage "${stage.title}" (${stage.id}) with module ${gauntlet.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
