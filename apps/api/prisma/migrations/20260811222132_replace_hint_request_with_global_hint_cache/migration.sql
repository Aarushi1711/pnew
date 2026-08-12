/*
  Warnings:

  - You are about to drop the `hint_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "hint_requests" DROP CONSTRAINT "hint_requests_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "hint_requests" DROP CONSTRAINT "hint_requests_user_id_fkey";

-- DropTable
DROP TABLE "hint_requests";

-- CreateTable
CREATE TABLE "hints" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "hint_text" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_hint_unlocks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "max_level_unlocked" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_hint_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hints_problem_id_level_key" ON "hints"("problem_id", "level");

-- CreateIndex
CREATE UNIQUE INDEX "user_hint_unlocks_user_id_problem_id_key" ON "user_hint_unlocks"("user_id", "problem_id");

-- AddForeignKey
ALTER TABLE "hints" ADD CONSTRAINT "hints_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_hint_unlocks" ADD CONSTRAINT "user_hint_unlocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_hint_unlocks" ADD CONSTRAINT "user_hint_unlocks_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
