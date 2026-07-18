-- CreateEnum
CREATE TYPE "RoadmapCategory" AS ENUM ('LEARNING', 'CAREER', 'EVENT', 'PROJECT');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED');

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "category" "RoadmapCategory" NOT NULL,
    "goal" TEXT NOT NULL,
    "currentSituation" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "constraints" TEXT NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'QUEUED',
    "plan" JSONB,
    "result" JSONB,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "rejectionReason" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);
