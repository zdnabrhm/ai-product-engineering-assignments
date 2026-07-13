import { TASK_QUEUE_NAME, taskJobSchema, type TaskJobData } from "@third-assignment/queue";
import { handleExampleTask } from "./tasks/example-task.js";
import { connection } from "@third-assignment/queue/connection";
import { Worker } from "bullmq";

const worker = new Worker<TaskJobData>(
  TASK_QUEUE_NAME,
  async (job) => {
    const data = taskJobSchema.parse(job.data);

    await handleExampleTask(data);
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log("Job completed:", job.id);
});

worker.on("failed", (job, error) => {
  console.log("Job failed:", job?.id, error);
});

worker.on("error", (error) => {
  console.log("Worker error:", error);
});

let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;

  isShuttingDown = true;
  console.log("Worker shutting down...");

  try {
    await worker.close();
  } catch (error) {
    console.error("Failed to close worker:", error);
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
