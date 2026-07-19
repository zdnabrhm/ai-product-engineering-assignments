import { prisma } from "@third-assignment/db";
import { roadmapJobSchema, type RoadmapJobData } from "@third-assignment/queue";
import type { Job } from "bullmq";
import { runRoadmapPipeline } from "../lib/roadmap-pipeline.js";

export async function generateRoadmap(job: Job<RoadmapJobData>): Promise<void> {
  const { roadmapId } = roadmapJobSchema.parse(job.data);
  const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });

  if (!roadmap || roadmap.status === "COMPLETED" || roadmap.status === "REJECTED") return;

  const claimed = await prisma.roadmap.updateMany({
    where: {
      id: roadmapId,
      status: { in: ["QUEUED", "PROCESSING"] },
    },
    data: {
      status: "PROCESSING",
      sources: [],
      rejectionReason: null,
      error: null,
    },
  });

  if (claimed.count === 0) return;

  try {
    const outcome = await runRoadmapPipeline({
      category: roadmap.category,
      goal: roadmap.goal,
      currentSituation: roadmap.currentSituation,
      targetDate: roadmap.targetDate,
      constraints: roadmap.constraints,
    });

    if (outcome.status === "rejected") {
      await prisma.roadmap.updateMany({
        where: { id: roadmapId, status: "PROCESSING" },
        data: {
          status: "REJECTED",
          rejectionReason: outcome.reason,
        },
      });
      return;
    }

    await prisma.roadmap.updateMany({
      where: { id: roadmapId, status: "PROCESSING" },
      data: {
        status: "COMPLETED",
        result: outcome.result,
        sources: outcome.sources,
      },
    });
  } catch (error) {
    console.error("Roadmap pipeline failed.", { roadmapId, attempt: job.attemptsMade + 1, error });

    const maxAttempts = job.opts.attempts ?? 1;
    const isFinalAttempt = job.attemptsMade + 1 >= maxAttempts;
    await prisma.roadmap.updateMany({
      where: { id: roadmapId, status: "PROCESSING" },
      data: {
        status: isFinalAttempt ? "FAILED" : "QUEUED",
        error: isFinalAttempt ? "Roadmap generation failed after retry." : null,
      },
    });

    throw error;
  }
}
