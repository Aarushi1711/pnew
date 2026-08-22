/**
 * Creates World 2: the "Structures" Track (orderIndex 2, unlockRule
 * requires Arrays >= 50% -- computed live: Arrays' real max is 36 stars,
 * 50% = 18, no rounding needed), plus its first Stage "Linked Lists"
 * (orderIndex 1, unlockRule: null -- a new world's first stage is always
 * open once the world itself unlocks) and Module "Linked List Basics".
 *
 * This recreates what was only ever a throwaway test fixture in the
 * previous task ("World 2 (Test)", correctly deleted as part of that
 * task's own cleanup) -- there was no real "Structures" track before this.
 *
 * Audited first: no existing Problem matches the linked-list pattern (see
 * the audit query in this task's conversation) -- genuinely new topic, as
 * expected.
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;

async function main() {
  const arrays = await prisma.track.findUniqueOrThrow({ where: { slug: 'arrays' } });

  const arrayStages = await prisma.stage.findMany({ where: { trackId: arrays.id } });
  let arraysMaxStars = 0;
  for (const stage of arrayStages) {
    const moduleCount = await prisma.module.count({ where: { stageId: stage.id } });
    arraysMaxStars += moduleCount * MAX_STARS_PER_MODULE;
  }
  const minPercent = arraysMaxStars * 0.5;
  console.log(`Arrays: real max = ${arraysMaxStars} stars -> 50% = ${minPercent}`);

  const structures = await prisma.track.create({
    data: {
      slug: 'structures',
      title: 'Structures',
      orderIndex: 2,
      description: 'Linked lists, trees, and the data structures arrays alone can\'t model.',
      unlockRule: { requiresTracks: [{ trackId: arrays.id, minPercent }] },
    },
  });

  const linkedLists = await prisma.stage.create({
    data: {
      trackId: structures.id,
      orderIndex: 1,
      title: 'Linked Lists',
      unlockRule: undefined, // explicit no-value -> stored as SQL NULL, per the task's "unlockRule: null" spec
    },
  });

  const basics = await prisma.module.create({
    data: {
      stageId: linkedLists.id,
      orderIndex: 1,
      title: 'Linked List Basics',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const problems = [
    {
      slug: 'reverse-linked-list',
      title: 'Reverse Linked List',
      difficulty: ProblemDifficulty.EASY,
      description: `Given the head of a singly linked list, reverse the list and return the new head.

Example:
1->2->3->4->5
Output: 5->4->3->2->1

Constraints:
The number of nodes is in the range [0, 5000].`,
    },
    {
      slug: 'merge-two-sorted-lists',
      title: 'Merge Two Sorted Lists',
      difficulty: ProblemDifficulty.EASY,
      description: `Merge two sorted linked lists and return it as one sorted list, by splicing together the nodes of the two input lists.

Example:
list1 = 1->2->4, list2 = 1->3->4
Output: 1->1->2->3->4->4

Constraints:
The number of nodes in both lists is in the range [0, 50].`,
    },
    {
      slug: 'linked-list-cycle',
      title: 'Linked List Cycle',
      difficulty: ProblemDifficulty.EASY,
      description: `Given the head of a linked list, determine if the list has a cycle in it -- a node that can be reached again by continuously following the .next pointer.

Example:
A list where the last node's .next points back to an earlier node
Output: true

Constraints:
The number of nodes is in the range [0, 10^4].
Your solution should use O(1) extra memory.`,
    },
  ];

  for (const [i, data] of problems.entries()) {
    const problem = await prisma.problem.create({ data });
    await prisma.moduleProblem.create({
      data: { moduleId: basics.id, problemId: problem.id, orderIndex: i + 1 },
    });
  }

  console.log(`Created track "${structures.title}" (${structures.id}) with stage "${linkedLists.title}" and module "${basics.title}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
