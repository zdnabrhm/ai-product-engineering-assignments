import {
  connection,
  WRITING_QUEUE_NAME,
  writingJobSchema,
  type WritingJobData,
} from "@third-assignment/queue";
import { Worker } from "bullmq";
import { generateWritingBeats } from "./jobs/generate-writing-beats.js";
import { disconnectDatabase } from "@third-assignment/db";

const worker = new Worker<WritingJobData>(
  WRITING_QUEUE_NAME,
  async (job) => {
    writingJobSchema.parse(job.data);
    await generateWritingBeats(job);
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log("Writing job completed:", job.id);
});

worker.on("failed", (job, error) => {
  console.log("Writing job failed:", job?.id, error);
});

worker.on("error", (error) => {
  console.log("Worker error:", error);
});

async function shutdown() {
  await worker.close();
  await disconnectDatabase();
}

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});
