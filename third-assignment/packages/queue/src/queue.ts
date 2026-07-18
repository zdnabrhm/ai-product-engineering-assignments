import { Queue } from "bullmq";
import { ROADMAP_QUEUE_NAME, type RoadmapJobData } from "./schema.js";
import { connection } from "./connection.js";

export const roadmapQueue = new Queue<RoadmapJobData>(ROADMAP_QUEUE_NAME, { connection });
