import type { ConnectionOptions } from "bullmq";
import { env } from "../utils/env.js";

export const WORKOUT_PLAN_QUEUE_NAME = "workout-plan-generation";

export const connection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
};
