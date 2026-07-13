import { Queue } from "bullmq";
import { TASK_QUEUE_NAME, type TaskJobData } from "./schema.js";
import { connection } from "./connection.js";

export const taskQueue = new Queue<TaskJobData>(TASK_QUEUE_NAME, { connection });
