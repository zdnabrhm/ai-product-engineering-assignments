import { Queue } from "bullmq";
import { WRITING_QUEUE_NAME, type WritingJobData } from "./schema.js";
import { connection } from "./connection.js";

export const writingQueue = new Queue<WritingJobData>(WRITING_QUEUE_NAME, { connection });
