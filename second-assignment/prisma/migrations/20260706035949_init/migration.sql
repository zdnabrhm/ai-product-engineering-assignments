-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('QUEUED', 'PROCESSING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'QUEUED',
    "result" JSONB,
    "pdfPath" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutPlan_status_idx" ON "WorkoutPlan"("status");

-- CreateIndex
CREATE INDEX "WorkoutPlan_createdAt_idx" ON "WorkoutPlan"("createdAt");
