import { Worker } from "bullmq";
import { connection, WORKOUT_PLAN_QUEUE_NAME } from "./lib/bullmq.js";
import { logger } from "./lib/logger.js";
import { markWorkoutPlanFailed, runWorkoutPlanWorkflow } from "./modules/workout/services.js";
import type { WorkoutPlanJobData } from "./utils/queue.js";

export const worker = new Worker<WorkoutPlanJobData>(
  WORKOUT_PLAN_QUEUE_NAME,
  async (job) => {
    try {
      await runWorkoutPlanWorkflow(job.data.planId);
    } catch (error) {
      const maximumAttempts = job.opts.attempts ?? 1;
      const isFinalAttempt = job.attemptsMade + 1 >= maximumAttempts;

      if (isFinalAttempt) {
        await markWorkoutPlanFailed(job.data.planId, error);
      }

      throw error;
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  logger.info(
    {
      component: "workout-worker",
      queue: WORKOUT_PLAN_QUEUE_NAME,
      jobId: job.id,
      planId: job.data.planId,
      attempt: job.attemptsMade + 1,
    },
    "workout plan job completed",
  );
});

worker.on("failed", (job, error) => {
  logger.error(
    {
      err: error,
      component: "workout-worker",
      queue: WORKOUT_PLAN_QUEUE_NAME,
      jobId: job?.id,
      planId: job?.data.planId,
      attempt: job ? job.attemptsMade : undefined,
    },
    "workout plan job failed",
  );
});

async function shutdown() {
  logger.info({ component: "workout-worker" }, "worker shutting down");
  await worker.close();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
