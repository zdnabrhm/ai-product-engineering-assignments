import {
  connection,
  ROADMAP_QUEUE_NAME,
  roadmapJobSchema,
  type RoadmapJobData,
} from "@third-assignment/queue";
import { Worker } from "bullmq";
import { generateRoadmap } from "./jobs/generate-roadmap.js";
import { disconnectDatabase } from "@third-assignment/db";

const worker = new Worker<RoadmapJobData>(
  ROADMAP_QUEUE_NAME,
  async (job) => {
    roadmapJobSchema.parse(job.data);
    await generateRoadmap(job);
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log("Roadmap job completed:", job.id);
});

worker.on("failed", (job, error) => {
  console.error("Roadmap job failed:", job?.id, error);
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
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
