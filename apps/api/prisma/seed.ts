import { ModuleContentType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const track = await prisma.track.create({
    data: {
      slug: 'arrays',
      title: 'Arrays',
      orderIndex: 1,
      description: 'Foundational array manipulation and traversal techniques.',
    },
  });

  const stage = await prisma.stage.create({
    data: {
      trackId: track.id,
      orderIndex: 1,
      title: 'Array Basics',
      unlockRule: { type: 'always_unlocked' },
    },
  });

  const stageModule = await prisma.module.create({
    data: {
      stageId: stage.id,
      orderIndex: 1,
      title: 'Introduction to Arrays',
      contentType: ModuleContentType.PROBLEM_SET,
    },
  });

  const problem = await prisma.problem.create({
    data: {
      slug: 'two-sum',
      title: 'Two Sum',
      description:
        'Given an array of integers and a target value, return the indices of the two numbers that add up to the target.',
    },
  });

  await prisma.moduleProblem.create({
    data: {
      moduleId: stageModule.id,
      problemId: problem.id,
      orderIndex: 1,
    },
  });

  console.log('Seed complete. Verifying the relationship chain via a nested query:\n');

  const result = await prisma.track.findUnique({
    where: { slug: 'arrays' },
    include: {
      stages: {
        include: {
          modules: {
            include: {
              problems: {
                include: { problem: true },
              },
            },
          },
        },
      },
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
