import {
  prisma,
  roadmapPlanSchema,
  roadmapResultSchema,
  roadmapSourcesSchema,
  type Roadmap,
} from "@third-assignment/db";
import { ROADMAP_JOB_NAME, roadmapQueue } from "@third-assignment/queue";
import { HTTPException } from "hono/http-exception";
import type { z } from "zod";
import type { createRoadmapSchema } from "./schema.js";

export type CreateRoadmapInput = z.infer<typeof createRoadmapSchema>;

type RoadmapSummary = Pick<
  Roadmap,
  "id" | "category" | "goal" | "status" | "targetDate" | "createdAt" | "updatedAt"
>;

function getRoadmapJobId(roadmapId: string): string {
  return `roadmap-${roadmapId}`;
}

async function enqueueRoadmap(roadmapId: string): Promise<void> {
  await roadmapQueue.add(
    ROADMAP_JOB_NAME,
    { roadmapId },
    {
      jobId: getRoadmapJobId(roadmapId),
      attempts: 2,
      backoff: { type: "exponential", delay: 1_000 },
      removeOnComplete: 100,
      removeOnFail: true,
    },
  );
}

function serializeRoadmapSummary(roadmap: RoadmapSummary) {
  return {
    id: roadmap.id,
    category: roadmap.category,
    goal: roadmap.goal,
    status: roadmap.status,
    targetDate: roadmap.targetDate.toISOString().slice(0, 10),
    createdAt: roadmap.createdAt.toISOString(),
    updatedAt: roadmap.updatedAt.toISOString(),
  };
}

function serializeRoadmap(roadmap: Roadmap) {
  return {
    id: roadmap.id,
    category: roadmap.category,
    goal: roadmap.goal,
    currentSituation: roadmap.currentSituation,
    targetDate: roadmap.targetDate.toISOString().slice(0, 10),
    constraints: roadmap.constraints,
    status: roadmap.status,
    plan: roadmap.plan === null ? null : roadmapPlanSchema.parse(roadmap.plan),
    result: roadmap.result === null ? null : roadmapResultSchema.parse(roadmap.result),
    sources: roadmapSourcesSchema.parse(roadmap.sources),
    rejectionReason: roadmap.rejectionReason,
    error: roadmap.error,
    createdAt: roadmap.createdAt.toISOString(),
    updatedAt: roadmap.updatedAt.toISOString(),
  };
}

export async function createRoadmap(input: CreateRoadmapInput) {
  const roadmap = await prisma.roadmap.create({
    data: {
      ...input,
      targetDate: new Date(`${input.targetDate}T00:00:00.000Z`),
      sources: [],
    },
  });

  try {
    await enqueueRoadmap(roadmap.id);
  } catch (cause) {
    console.error("Failed to enqueue roadmap.", { roadmapId: roadmap.id, cause });
    await prisma.roadmap.update({
      where: { id: roadmap.id },
      data: { status: "FAILED", error: "Could not start roadmap generation." },
    });
    throw new HTTPException(503, {
      message: "Could not start roadmap generation.",
      cause,
    });
  }

  return serializeRoadmap(roadmap);
}

export async function getRoadmap(id: string) {
  const roadmap = await prisma.roadmap.findUnique({ where: { id } });
  if (!roadmap) {
    throw new HTTPException(404, { message: "Roadmap not found." });
  }
  return serializeRoadmap(roadmap);
}

export async function listRoadmaps() {
  const roadmaps = await prisma.roadmap.findMany({
    select: {
      id: true,
      category: true,
      goal: true,
      status: true,
      targetDate: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return roadmaps.map(serializeRoadmapSummary);
}

export async function deleteRoadmap(id: string): Promise<void> {
  const deleted = await prisma.roadmap.deleteMany({ where: { id } });

  if (deleted.count === 0) {
    throw new HTTPException(404, { message: "Roadmap not found." });
  }

  try {
    await roadmapQueue.remove(getRoadmapJobId(id));
  } catch (cause) {
    console.error("Failed to remove deleted roadmap from the queue.", { roadmapId: id, cause });
  }
}

export async function retryRoadmap(id: string) {
  const updated = await prisma.roadmap.updateMany({
    where: { id, status: "FAILED" },
    data: {
      status: "QUEUED",
      error: null,
      rejectionReason: null,
      sources: [],
    },
  });

  if (updated.count === 0) {
    const exists = await prisma.roadmap.findUnique({ where: { id }, select: { id: true } });
    throw new HTTPException(exists ? 409 : 404, {
      message: exists ? "Only failed roadmaps can be retried." : "Roadmap not found.",
    });
  }

  try {
    await enqueueRoadmap(id);
  } catch (cause) {
    console.error("Failed to enqueue roadmap retry.", { roadmapId: id, cause });
    await prisma.roadmap.update({
      where: { id },
      data: { status: "FAILED", error: "Could not enqueue roadmap retry." },
    });
    throw new HTTPException(503, {
      message: "Could not retry roadmap generation.",
      cause,
    });
  }

  return getRoadmap(id);
}
