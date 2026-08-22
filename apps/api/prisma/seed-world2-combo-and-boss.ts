/**
 * Completes World 2 (Structures), mirroring World 1's structure: a combo
 * stage requiring two prior stages, then a boss stage requiring all three.
 * Both go at the end (orderIndex 4, 5) -- unlike World 1, nothing currently
 * occupies those slots in Structures, so no swap/reorder is needed.
 *
 * Thresholds computed live below. All three core stages (Linked Lists,
 * Stacks, Queues) have exactly 1 module -> 3 max stars each, so both
 * formulas land unambiguously on the same number:
 *   - Combo: ceil(50% of 3) = 2 for each dependency
 *   - Boss:  ceil(2/3 of 3) = 2 for each dependency (same formula as the
 *            World 1 boss)
 * No rounding conflict this time (unlike the earlier Two Pointers case),
 * so no check-in needed before finalizing.
 *
 * Audited first: "Sliding Window Maximum" already exists (World 1 boss) --
 * reused via a second ModuleProblem link, not duplicated. "Evaluate Reverse
 * Polish Notation" matched a keyword search but is a different problem
 * (RPN vs. infix-with-parentheses). Everything else is genuinely new.
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;

async function main() {
  const structures = await prisma.track.findUniqueOrThrow({ where: { slug: 'structures' } });
  const linkedLists = await prisma.stage.findFirstOrThrow({ where: { trackId: structures.id, title: 'Linked Lists' } });
  const stacks = await prisma.stage.findFirstOrThrow({ where: { trackId: structures.id, title: 'Stacks' } });
  const queues = await prisma.stage.findFirstOrThrow({ where: { trackId: structures.id, title: 'Queues' } });

  async function maxStarsOf(stageId: string) {
    const moduleCount = await prisma.module.count({ where: { stageId } });
    return moduleCount * MAX_STARS_PER_MODULE;
  }

  const linkedListsMax = await maxStarsOf(linkedLists.id);
  const stacksMax = await maxStarsOf(stacks.id);
  const queuesMax = await maxStarsOf(queues.id);

  const comboMinLinkedLists = Math.ceil(linkedListsMax * 0.5);
  const comboMinStacks = Math.ceil(stacksMax * 0.5);
  console.log(
    `Combo thresholds: Linked Lists max=${linkedListsMax} -> 50%=${linkedListsMax * 0.5} -> ceil=${comboMinLinkedLists}; ` +
      `Stacks max=${stacksMax} -> 50%=${stacksMax * 0.5} -> ceil=${comboMinStacks}`,
  );

  const bossMinLinkedLists = Math.ceil(linkedListsMax * (2 / 3));
  const bossMinStacks = Math.ceil(stacksMax * (2 / 3));
  const bossMinQueues = Math.ceil(queuesMax * (2 / 3));
  console.log(
    `Boss thresholds: Linked Lists max=${linkedListsMax} -> 2/3=${(linkedListsMax * (2 / 3)).toFixed(2)} -> ceil=${bossMinLinkedLists}; ` +
      `Stacks max=${stacksMax} -> 2/3=${(stacksMax * (2 / 3)).toFixed(2)} -> ceil=${bossMinStacks}; ` +
      `Queues max=${queuesMax} -> 2/3=${(queuesMax * (2 / 3)).toFixed(2)} -> ceil=${bossMinQueues}`,
  );

  // --- Stage A: combo ---
  const combo = await prisma.stage.create({
    data: {
      trackId: structures.id,
      orderIndex: 4,
      title: 'Linked Lists + Stacks Mix',
      unlockRule: {
        requiresStages: [
          { stageId: linkedLists.id, minStars: comboMinLinkedLists },
          { stageId: stacks.id, minStars: comboMinStacks },
        ],
      },
    },
  });

  const comboModule = await prisma.module.create({
    data: {
      stageId: combo.id,
      orderIndex: 1,
      title: 'Linked List & Stack Practice',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const comboProblems = [
    {
      slug: 'remove-nth-node-from-end-of-list',
      title: 'Remove Nth Node From End of List',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given the head of a linked list, remove the nth node from the end of the list and return its head.

Example:
1->2->3->4->5, n = 2
Output: 1->2->3->5

Constraints:
The number of nodes is sz.
1 <= sz <= 30
1 <= n <= sz`,
    },
    {
      slug: 'palindrome-linked-list',
      title: 'Palindrome Linked List',
      difficulty: ProblemDifficulty.EASY,
      description: `Given the head of a singly linked list, determine if it reads the same forwards and backwards.

Example:
1->2->2->1
Output: true

Example:
1->2
Output: false

Constraints:
The number of nodes is in the range [1, 10^5].`,
    },
    {
      slug: 'decode-string',
      title: 'Decode String',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Given an encoded string, return its decoded string. The encoding rule is k[encoded_string], where the encoded_string inside the square brackets is repeated exactly k times. A stack-based approach handles the nesting naturally.

Example:
s = "3[a2[c]]"
Output: "accaccacc"

Example:
s = "2[abc]3[cd]ef"
Output: "abcabccdcdcdef"

Constraints:
1 <= s.length <= 30
k is guaranteed to be a positive integer.`,
    },
  ];

  for (const [i, data] of comboProblems.entries()) {
    const problem = await prisma.problem.create({ data });
    await prisma.moduleProblem.create({ data: { moduleId: comboModule.id, problemId: problem.id, orderIndex: i + 1 } });
  }

  console.log(`Created combo stage "${combo.title}" (${combo.id}) with module ${comboModule.id}.`);

  // --- Stage B: boss ---
  const boss = await prisma.stage.create({
    data: {
      trackId: structures.id,
      orderIndex: 5,
      title: 'World 2 Boss Challenge',
      unlockRule: {
        requiresStages: [
          { stageId: linkedLists.id, minStars: bossMinLinkedLists },
          { stageId: stacks.id, minStars: bossMinStacks },
          { stageId: queues.id, minStars: bossMinQueues },
        ],
      },
    },
  });

  const bossModule = await prisma.module.create({
    data: {
      stageId: boss.id,
      orderIndex: 1,
      title: 'The Gauntlet II',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const lruCache = await prisma.problem.create({
    data: {
      slug: 'lru-cache',
      title: 'LRU Cache',
      difficulty: ProblemDifficulty.HARD,
      description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache, combining a hash map with a doubly linked list to get O(1) get and put.

Implement the LRUCache class:
- LRUCache(capacity) initializes the cache with positive size capacity.
- get(key) returns the value if present, otherwise -1.
- put(key, value) updates or inserts the value. If the number of keys exceeds capacity, evict the least recently used key.

Example:
LRUCache(2)
put(1,1), put(2,2)
get(1) -> 1
put(3,3) (evicts key 2)
get(2) -> -1

Constraints:
1 <= capacity <= 3000
At most 2 * 10^5 calls to get and put.`,
    },
  });

  const slidingWindowMaximum = await prisma.problem.findUniqueOrThrow({ where: { slug: 'sliding-window-maximum' } });

  const basicCalculator = await prisma.problem.create({
    data: {
      slug: 'basic-calculator',
      title: 'Basic Calculator',
      difficulty: ProblemDifficulty.HARD,
      description: `Implement a basic calculator to evaluate a string expression, given as a sequence of non-negative integers, '+', '-', '(', ')', and spaces. A stack tracks the running result and sign across nested parentheses.

Example:
s = "1 + 1"
Output: 2

Example:
s = "(1+(4+5+2)-3)+(6+8)"
Output: 23

Constraints:
1 <= s.length <= 3 * 10^5
No multiplication or division.`,
    },
  });

  await prisma.moduleProblem.create({ data: { moduleId: bossModule.id, problemId: lruCache.id, orderIndex: 1 } });
  await prisma.moduleProblem.create({ data: { moduleId: bossModule.id, problemId: slidingWindowMaximum.id, orderIndex: 2 } });
  await prisma.moduleProblem.create({ data: { moduleId: bossModule.id, problemId: basicCalculator.id, orderIndex: 3 } });

  console.log(`Created boss stage "${boss.title}" (${boss.id}) with module ${bossModule.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
