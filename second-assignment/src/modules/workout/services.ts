import { resolve } from "node:path";
import { prisma } from "../../lib/prisma.js";
import { workoutPlanQueue } from "../../utils/queue.js";
import { writeWorkoutPlanPdf } from "./pdf.js";
import { runWorkoutPlanPipeline } from "./pipeline.js";
import { createWorkoutPlanInputSchema, type CreateWorkoutPlanInput } from "./schema.js";

export async function createWorkoutPlan(input: CreateWorkoutPlanInput) {
  const plan = await prisma.workoutPlan.create({
    data: {
      input: input,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  try {
    await workoutPlanQueue.add(
      "generate-workout-plan",
      { planId: plan.id },
      {
        jobId: plan.id,
        attempts: 2,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );
  } catch (error) {
    await prisma.workoutPlan.update({
      where: { id: plan.id },
      data: {
        status: "FAILED",
        errorMessage: "Failed to enqueue workout plan generation.",
      },
    });
    throw error;
  }

  return plan;
}

export async function getWorkoutPlan(id: string) {
  const plan = await prisma.workoutPlan.findUnique({
    where: { id },
    select: {
      id: true,
      input: true,
      status: true,
      result: true,
      errorMessage: true,
      pdfPath: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!plan) {
    return null;
  }

  return {
    id: plan.id,
    input: plan.input,
    status: plan.status,
    result: plan.result,
    errorMessage: plan.errorMessage,
    downloadUrl: plan.status === "DONE" && plan.pdfPath ? `/workout-plans/${plan.id}/pdf` : null,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

export async function getWorkoutPlanPdf(id: string) {
  const plan = await prisma.workoutPlan.findUnique({
    where: { id },
    select: { status: true, pdfPath: true },
  });

  if (!plan) {
    return { state: "NOT_FOUND" as const };
  }

  if (plan.status === "FAILED") {
    return { state: "FAILED" as const };
  }

  if (plan.status !== "DONE" || !plan.pdfPath) {
    return { state: "NOT_READY" as const };
  }

  return {
    state: "READY" as const,
    path: resolve(plan.pdfPath),
  };
}

export async function runWorkoutPlanWorkflow(planId: string) {
  await prisma.workoutPlan.update({
    where: { id: planId },
    data: {
      status: "PROCESSING",
      errorMessage: null,
    },
  });

  const record = await prisma.workoutPlan.findUnique({
    where: { id: planId },
    select: { input: true },
  });

  if (!record) {
    throw new Error("Workout plan request not found.");
  }

  const input = createWorkoutPlanInputSchema.parse(record.input);
  const result = await runWorkoutPlanPipeline(input);
  const pdfPath = `reports/${planId}.pdf`;

  await writeWorkoutPlanPdf({
    input,
    plan: result,
    filePath: resolve(pdfPath),
  });

  await prisma.workoutPlan.update({
    where: { id: planId },
    data: {
      status: "DONE",
      result: result,
      pdfPath,
      errorMessage: null,
    },
  });
}

export async function markWorkoutPlanFailed(planId: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown workflow error.";

  await prisma.workoutPlan
    .update({
      where: { id: planId },
      data: {
        status: "FAILED",
        errorMessage: message,
      },
    })
    .catch(() => undefined);
}
