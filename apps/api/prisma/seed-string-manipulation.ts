/**
 * Adds a new "String Manipulation Basics" stage to the Arrays track, at
 * orderIndex 7 (after Kadane's & Subarray Problems), pushing the existing
 * "Arrays + Two Pointers Mix" combo stage to orderIndex 8 -- same
 * temp-value swap pattern used for the previous four additions.
 *
 * Unlock rule: 50% of Kadane's real max stars, computed live below.
 * Kadane's has 1 module (max 3 stars) -> 50% = 1.5 -> ceil = 2, same
 * ceil-rounding convention established for the prior two stages.
 *
 * Audited first: no existing Problem matches "Reverse String", "Valid
 * Anagram", or "Longest Common Prefix" (see the audit query in this task's
 * conversation). Valid Palindrome already exists under Two Pointers and is
 * deliberately left untouched -- it's a different technique/question
 * (palindrome check vs. reverse/anagram/prefix), not a duplicate.
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;
const COMBO_STAGE_ID = 'cmsoxuw2i000nl4z8ou0f3bl8';
const TEMP_ORDER_INDEX = 999;

async function main() {
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: 'arrays' } });
  const kadane = await prisma.stage.findFirstOrThrow({
    where: { trackId: track.id, title: "Kadane's & Subarray Problems" },
  });

  const kadaneModuleCount = await prisma.module.count({ where: { stageId: kadane.id } });
  const kadaneMaxStars = kadaneModuleCount * MAX_STARS_PER_MODULE;
  const rawFiftyPercent = kadaneMaxStars * 0.5;
  const minStars = Math.ceil(rawFiftyPercent);
  console.log(
    `Kadane's: ${kadaneModuleCount} module(s) -> max ${kadaneMaxStars} stars -> 50% = ${rawFiftyPercent} -> ceil = ${minStars}`,
  );

  await prisma.$transaction([
    prisma.stage.update({ where: { id: COMBO_STAGE_ID }, data: { orderIndex: TEMP_ORDER_INDEX } }),
    prisma.stage.update({ where: { id: COMBO_STAGE_ID }, data: { orderIndex: 8 } }),
  ]);

  const stage = await prisma.stage.create({
    data: {
      trackId: track.id,
      orderIndex: 7,
      title: 'String Manipulation Basics',
      unlockRule: { requiresStages: [{ stageId: kadane.id, minStars }] },
    },
  });

  const basics = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 1,
      title: 'String Basics',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const problems = [
    {
      slug: 'reverse-string',
      title: 'Reverse String',
      difficulty: ProblemDifficulty.EASY,
      description: `Write a function that reverses a string. The input string is given as an array of characters, and must be modified in-place with O(1) extra memory.

Example:
["h","e","l","l","o"]
Output: ["o","l","l","e","h"]

Constraints:
1 <= s.length <= 10^5`,
    },
    {
      slug: 'valid-anagram',
      title: 'Valid Anagram',
      difficulty: ProblemDifficulty.EASY,
      description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

Example:
s = "anagram", t = "nagaram"
Output: true

s = "rat", t = "car"
Output: false

Constraints:
1 <= s.length, t.length <= 5 * 10^4`,
    },
    {
      slug: 'longest-common-prefix',
      title: 'Longest Common Prefix',
      difficulty: ProblemDifficulty.EASY,
      description: `Given an array of strings, find the longest common prefix string amongst all of them. Return an empty string if there is no common prefix.

Example:
strs = ["flower","flow","flight"]
Output: "fl"

Example:
strs = ["dog","racecar","car"]
Output: "" (no common prefix)

Constraints:
1 <= strs.length <= 200`,
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
