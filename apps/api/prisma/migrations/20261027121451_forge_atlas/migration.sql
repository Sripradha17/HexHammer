-- CreateTable
CREATE TABLE "Preference" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 30,
    "weeklyGoalTopics" INTEGER NOT NULL DEFAULT 2,
    "difficulty" TEXT NOT NULL DEFAULT 'core',
    "motion" TEXT NOT NULL DEFAULT 'system',
    "reviewIntensity" TEXT NOT NULL DEFAULT 'normal',
    "preferredDomainId" TEXT,
    "strictUnlocking" BOOLEAN NOT NULL DEFAULT false,
    "notifyReviews" BOOLEAN NOT NULL DEFAULT true,
    "notifyRadar" BOOLEAN NOT NULL DEFAULT true,
    "radarCategories" JSONB NOT NULL DEFAULT '["security","framework","ai-platform","cloud","devops","standards","publication"]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicProgress" (
    "topicId" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lessonReadAt" TIMESTAMP(3),
    "exercisesDone" JSONB NOT NULL DEFAULT '[]',
    "bestAssessmentScore" DOUBLE PRECISION,
    "assessmentPassedAt" TIMESTAMP(3),
    "reviewsPassed" INTEGER NOT NULL DEFAULT 0,
    "masteredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("topicId")
);

-- CreateTable
CREATE TABLE "AssessmentAttempt" (
    "id" SERIAL NOT NULL,
    "topicId" TEXT NOT NULL,
    "contentVersion" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionAttempt" (
    "id" SERIAL NOT NULL,
    "questionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "elementsHit" JSONB NOT NULL DEFAULT '[]',
    "selfRating" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewItem" (
    "id" SERIAL NOT NULL,
    "kind" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "lastResult" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" SERIAL NOT NULL,
    "reviewItemId" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XpEvent" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "topicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detail" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "topicId" TEXT,
    "detail" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "topicId" TEXT,
    "domainId" TEXT,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "objectives" JSONB NOT NULL DEFAULT '[]',
    "prerequisites" JSONB NOT NULL DEFAULT '[]',
    "requirements" JSONB NOT NULL DEFAULT '[]',
    "acceptanceCriteria" JSONB NOT NULL DEFAULT '[]',
    "technologies" JSONB NOT NULL DEFAULT '[]',
    "tasks" JSONB NOT NULL DEFAULT '[]',
    "tests" JSONB NOT NULL DEFAULT '[]',
    "stretchGoals" JSONB NOT NULL DEFAULT '[]',
    "repoUrl" TEXT,
    "demoUrl" TEXT,
    "evidence" TEXT,
    "reflection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "doneWhen" TEXT NOT NULL,
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "topicIds" JSONB NOT NULL DEFAULT '[]',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "checkIntervalHours" INTEGER NOT NULL DEFAULT 168,
    "validationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "lastValidatedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "lastError" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "pageHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechUpdate" (
    "id" SERIAL NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "titleKey" TEXT NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technology" TEXT NOT NULL,
    "topicIds" JSONB NOT NULL DEFAULT '[]',
    "classification" TEXT NOT NULL,
    "classificationReason" TEXT NOT NULL,
    "analysisBy" TEXT NOT NULL DEFAULT 'rules',
    "aiAnalysis" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "reviewStatus" TEXT NOT NULL DEFAULT 'new',
    "seenCount" INTEGER NOT NULL DEFAULT 1,
    "alsoSeenIn" JSONB NOT NULL DEFAULT '[]',
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadarRun" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER,
    "kind" TEXT NOT NULL DEFAULT 'source-check',
    "trigger" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsNew" INTEGER NOT NULL DEFAULT 0,
    "itemsDuplicate" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "detail" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "RadarRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumProposal" (
    "id" SERIAL NOT NULL,
    "updateId" INTEGER,
    "topicId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "changeReason" TEXT NOT NULL,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "content" JSONB NOT NULL,
    "affectedExercises" JSONB NOT NULL DEFAULT '[]',
    "affectedQuestions" JSONB NOT NULL DEFAULT '[]',
    "migrationNotes" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "CurriculumProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicVersion" (
    "id" SERIAL NOT NULL,
    "topicId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "previousVersion" INTEGER NOT NULL,
    "proposalId" INTEGER NOT NULL,
    "changeReason" TEXT NOT NULL,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "addendum" JSONB NOT NULL,
    "migrationNotes" TEXT NOT NULL DEFAULT '',
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" JSONB NOT NULL DEFAULT '{}',
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentAttempt_topicId_idx" ON "AssessmentAttempt"("topicId");

-- CreateIndex
CREATE INDEX "QuestionAttempt_questionId_idx" ON "QuestionAttempt"("questionId");

-- CreateIndex
CREATE INDEX "QuestionAttempt_topicId_idx" ON "QuestionAttempt"("topicId");

-- CreateIndex
CREATE INDEX "ReviewItem_dueAt_idx" ON "ReviewItem"("dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewItem_kind_refId_key" ON "ReviewItem"("kind", "refId");

-- CreateIndex
CREATE UNIQUE INDEX "XpEvent_key_key" ON "XpEvent"("key");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TechSource_url_key" ON "TechSource"("url");

-- CreateIndex
CREATE UNIQUE INDEX "TechUpdate_canonicalUrl_key" ON "TechUpdate"("canonicalUrl");

-- CreateIndex
CREATE INDEX "TechUpdate_titleKey_idx" ON "TechUpdate"("titleKey");

-- CreateIndex
CREATE UNIQUE INDEX "TopicVersion_proposalId_key" ON "TopicVersion"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicVersion_topicId_version_key" ON "TopicVersion"("topicId", "version");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_reviewItemId_fkey" FOREIGN KEY ("reviewItemId") REFERENCES "ReviewItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechUpdate" ADD CONSTRAINT "TechUpdate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TechSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadarRun" ADD CONSTRAINT "RadarRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TechSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumProposal" ADD CONSTRAINT "CurriculumProposal_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "TechUpdate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVersion" ADD CONSTRAINT "TopicVersion_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "CurriculumProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
