-- CreateTable
CREATE TABLE "hint_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "hint_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hint_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hint_requests_user_id_problem_id_level_key" ON "hint_requests"("user_id", "problem_id", "level");

-- AddForeignKey
ALTER TABLE "hint_requests" ADD CONSTRAINT "hint_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hint_requests" ADD CONSTRAINT "hint_requests_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
