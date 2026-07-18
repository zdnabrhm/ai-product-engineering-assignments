-- CreateEnum
CREATE TYPE "WritingStatus" AS ENUM ('QUEUED', 'GENERATING_BEATS', 'WAITING_FOR_CHOICE', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "WritingProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rawMaterial" TEXT NOT NULL,
    "prerequisites" TEXT NOT NULL,
    "article" TEXT NOT NULL DEFAULT '',
    "groundedConcepts" JSONB NOT NULL DEFAULT '[]',
    "candidates" JSONB NOT NULL DEFAULT '[]',
    "status" "WritingStatus" NOT NULL DEFAULT 'QUEUED',
    "revision" INTEGER NOT NULL DEFAULT 0,
    "canFinish" BOOLEAN NOT NULL DEFAULT false,
    "generationNote" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingProject_pkey" PRIMARY KEY ("id")
);
