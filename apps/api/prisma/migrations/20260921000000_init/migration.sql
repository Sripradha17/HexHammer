-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Level" (
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "runner" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "plannedStrikes" JSONB NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "Strike" (
    "id" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "lookText" TEXT NOT NULL,
    "typeText" TEXT NOT NULL,
    "breakText" TEXT NOT NULL,
    "sayText" TEXT NOT NULL,
    "starterCode" TEXT NOT NULL,
    "tests" TEXT NOT NULL,
    "hints" JSONB NOT NULL,
    "solution" TEXT NOT NULL,

    CONSTRAINT "Strike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "strikeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "savedCode" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "passedAt" TIMESTAMP(3),

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("strikeId")
);

-- CreateTable
CREATE TABLE "SayNote" (
    "strikeId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SayNote_pkey" PRIMARY KEY ("strikeId")
);

-- CreateTable
CREATE TABLE "InterviewCard" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "box" INTEGER NOT NULL DEFAULT 1,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakDay" (
    "date" TEXT NOT NULL,

    CONSTRAINT "StreakDay_pkey" PRIMARY KEY ("date")
);

-- CreateIndex
CREATE UNIQUE INDEX "Strike_levelNumber_order_key" ON "Strike"("levelNumber", "order");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewCard_level_question_key" ON "InterviewCard"("level", "question");

-- AddForeignKey
ALTER TABLE "Strike" ADD CONSTRAINT "Strike_levelNumber_fkey" FOREIGN KEY ("levelNumber") REFERENCES "Level"("number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_strikeId_fkey" FOREIGN KEY ("strikeId") REFERENCES "Strike"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SayNote" ADD CONSTRAINT "SayNote_strikeId_fkey" FOREIGN KEY ("strikeId") REFERENCES "Strike"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

