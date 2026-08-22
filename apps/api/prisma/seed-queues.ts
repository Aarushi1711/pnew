/**
 * Adds a new "Queues" stage to the Structures track, at orderIndex 3
 * (after Stacks). Unlock rule: 50% of Stacks' real max stars, computed
 * live below. Stacks has 1 module (max 3 stars) -> 50% = 1.5 -> ceil = 2,
 * same ceil-rounding convention established throughout this session.
 *
 * Audited first: no existing Problem matches the queue pattern (see the
 * audit query in this task's conversation) -- genuinely new topic.
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;

async function main() {
  const structures = await prisma.track.findUniqueOrThrow({ where: { slug: 'structures' } });
  const stacks = await prisma.stage.findFirstOrThrow({
    where: { trackId: structures.id, title: 'Stacks' },
  });

  const stacksModuleCount = await prisma.module.count({ where: { stageId: stacks.id } });
  const stacksMaxStars = stacksModuleCount * MAX_STARS_PER_MODULE;
  const rawFiftyPercent = stacksMaxStars * 0.5;
  const minStars = Math.ceil(rawFiftyPercent);
  console.log(
    `Stacks: ${stacksModuleCount} module(s) -> max ${stacksMaxStars} stars -> 50% = ${rawFiftyPercent} -> ceil = ${minStars}`,
  );

  const stage = await prisma.stage.create({
    data: {
      trackId: structures.id,
      orderIndex: 3,
      title: 'Queues',
      unlockRule: { requiresStages: [{ stageId: stacks.id, minStars }] },
    },
  });

  const basics = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 1,
      title: 'Queue Basics',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const problems = [
    {
      slug: 'implement-queue-using-stacks',
      title: 'Implement Queue using Stacks',
      difficulty: ProblemDifficulty.EASY,
      description: `Implement a first-in-first-out (FIFO) queue using only two stacks. The implemented queue should support push, pop, peek, and empty.

Implement the MyQueue class:
- push(x) pushes element x to the back of the queue.
- pop() removes and returns the element from the front of the queue.
- peek() returns the element at the front of the queue.
- empty() returns true if the queue is empty, false otherwise.

Example:
push(1), push(2)
peek() -> 1
pop() -> 1
empty() -> false

Constraints:
1 <= x <= 9
At most 100 calls to push, pop, peek, and empty.`,
    },
    {
      slug: 'design-circular-queue',
      title: 'Design Circular Queue',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Design a circular queue with a fixed size, where the last position connects back to the first to make a circle.

Implement the MyCircularQueue class:
- MyCircularQueue(k) initializes the queue with a fixed size k.
- enqueue(value) inserts an element; returns true if successful.
- dequeue() deletes an element; returns true if successful.
- Front() gets the front item, or -1 if empty.
- Rear() gets the last item, or -1 if empty.
- isEmpty() / isFull() check the queue's state.

Constraints:
1 <= k <= 1000
0 <= value <= 1000
At most 3000 calls to enqueue, dequeue, Front, Rear, isEmpty, isFull.`,
    },
    {
      slug: 'number-of-recent-calls',
      title: 'Number of Recent Calls',
      difficulty: ProblemDifficulty.EASY,
      description: `Implement the RecentCounter class, which counts the number of recent requests within a certain time frame. It receives requests with an increasing timestamp t (in milliseconds), and each call to ping(t) should return the number of pings that occurred in the range [t - 3000, t].

Example:
ping(1) -> 1
ping(100) -> 2
ping(3001) -> 3
ping(3002) -> 3

Constraints:
1 <= t <= 10^9
Each call to ping uses a strictly increasing value of t.
At most 10^4 calls to ping.`,
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
