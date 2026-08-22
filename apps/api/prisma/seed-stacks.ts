/**
 * Adds a new "Stacks" stage to the Structures track, at orderIndex 2
 * (after Linked Lists). Unlock rule: 50% of Linked Lists' real max stars,
 * computed live below. Linked Lists has 1 module (max 3 stars) -> 50% = 1.5
 * -> ceil = 2, same ceil-rounding convention established for Array Basics'
 * descendant stages.
 *
 * Audited first: no existing Problem matches the stack pattern (see the
 * audit query in this task's conversation) -- genuinely new topic.
 */
import { ModuleContentType, PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STARS_PER_MODULE = 3;

async function main() {
  const structures = await prisma.track.findUniqueOrThrow({ where: { slug: 'structures' } });
  const linkedLists = await prisma.stage.findFirstOrThrow({
    where: { trackId: structures.id, title: 'Linked Lists' },
  });

  const linkedListsModuleCount = await prisma.module.count({ where: { stageId: linkedLists.id } });
  const linkedListsMaxStars = linkedListsModuleCount * MAX_STARS_PER_MODULE;
  const rawFiftyPercent = linkedListsMaxStars * 0.5;
  const minStars = Math.ceil(rawFiftyPercent);
  console.log(
    `Linked Lists: ${linkedListsModuleCount} module(s) -> max ${linkedListsMaxStars} stars -> 50% = ${rawFiftyPercent} -> ceil = ${minStars}`,
  );

  const stage = await prisma.stage.create({
    data: {
      trackId: structures.id,
      orderIndex: 2,
      title: 'Stacks',
      unlockRule: { requiresStages: [{ stageId: linkedLists.id, minStars }] },
    },
  });

  const basics = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 1,
      title: 'Stack Basics',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const problems = [
    {
      slug: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: ProblemDifficulty.EASY,
      description: `Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if every open bracket is closed by the same type of bracket, and brackets are closed in the correct order.

Example:
s = "()[]{}"
Output: true

Example:
s = "(]"
Output: false

Constraints:
1 <= s.length <= 10^4`,
    },
    {
      slug: 'min-stack',
      title: 'Min Stack',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Design a stack that supports push, pop, top, and retrieving the minimum element, all in O(1) time.

Implement the MinStack class:
- push(val) pushes val onto the stack.
- pop() removes the element on top of the stack.
- top() gets the top element.
- getMin() retrieves the minimum element in the stack.

Example:
push(-2), push(0), push(-3)
getMin() -> -3
pop()
top() -> 0
getMin() -> -2

Constraints:
-2^31 <= val <= 2^31 - 1
Methods are called at most 3 * 10^4 times.`,
    },
    {
      slug: 'evaluate-reverse-polish-notation',
      title: 'Evaluate Reverse Polish Notation',
      difficulty: ProblemDifficulty.MEDIUM,
      description: `Evaluate the value of an arithmetic expression given in Reverse Polish Notation. Valid operators are +, -, *, and /. Each operand may be an integer or another expression.

Example:
tokens = ["2","1","+","3","*"]
Output: 9 ((2 + 1) * 3)

Example:
tokens = ["4","13","5","/","+"]
Output: 6 (4 + (13 / 5))

Constraints:
1 <= tokens.length <= 10^4
Division truncates toward zero.`,
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
