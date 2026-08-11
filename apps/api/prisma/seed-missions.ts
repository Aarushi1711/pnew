/**
 * One-off seed script for the two test missions.
 * Assumes prisma/seed.ts and prisma/seed-unlock-demo.ts have already run
 * (needs the "arrays" track's Array Basics stage to exist).
 * Run with: npx ts-node --compiler-options {"module":"commonjs"} prisma/seed-missions.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: 'arrays' } });
  const arrayBasics = await prisma.stage.findFirstOrThrow({
    where: { trackId: track.id, orderIndex: 1 },
  });

  const firstSteps = await prisma.mission.create({
    data: {
      slug: 'first-steps',
      title: 'First Steps',
      description: 'Solve 3 distinct problems anywhere on the platform.',
      criteria: { type: 'solve_count', count: 3 },
      rewardXp: 100,
    },
  });

  const arrayApprentice = await prisma.mission.create({
    data: {
      slug: 'array-apprentice',
      title: 'Array Apprentice',
      description: 'Earn at least 5 stars in the Array Basics stage.',
      criteria: { type: 'stage_stars', stageId: arrayBasics.id, minStars: 5 },
      rewardXp: 150,
    },
  });

  console.log('Seeded missions:');
  console.log({ firstStepsId: firstSteps.id, arrayApprenticeId: arrayApprentice.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
