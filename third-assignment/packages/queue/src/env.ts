import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    REDIS_HOST: z.string().min(1).default("localhost"),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_DB: z.coerce.number().int().nonnegative().default(0),
  },
  runtimeEnv: process.env,
});
