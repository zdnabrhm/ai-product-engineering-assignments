import type { ConnectionOptions } from "bullmq";
import { env } from "./env.js";

export const connection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
};
