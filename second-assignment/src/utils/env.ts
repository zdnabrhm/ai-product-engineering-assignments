import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive().default(8000),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    DATABASE_URL: z.string(),
    OPENAI_API_KEY: z.string(),
    OPENAI_BASE_URL: z.url(),

    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_DB: z.coerce.number().int().min(0).default(0),
  },
  runtimeEnv: process.env,
});
