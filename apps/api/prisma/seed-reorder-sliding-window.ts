/**
 * Swaps display order only: Sliding Window moves from orderIndex 4 to 3,
 * and "Arrays + Two Pointers Mix" moves from 3 to 4. Neither stage's
 * unlockRule is touched. Stage has @@unique([trackId, orderIndex]), so the
 * swap goes through a temporary orderIndex to avoid a transient collision.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SLIDING_WINDOW_ID = 'cmt1pjdhs0001l4y8o39veowq';
const COMBO_ID = 'cmsoxuw2i000nl4z8ou0f3bl8';
const TEMP_ORDER_INDEX = 999;

async function main() {
  await prisma.$transaction([
    prisma.stage.update({ where: { id: SLIDING_WINDOW_ID }, data: { orderIndex: TEMP_ORDER_INDEX } }),
    prisma.stage.update({ where: { id: COMBO_ID }, data: { orderIndex: 4 } }),
    prisma.stage.update({ where: { id: SLIDING_WINDOW_ID }, data: { orderIndex: 3 } }),
  ]);

  console.log('Reorder complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
