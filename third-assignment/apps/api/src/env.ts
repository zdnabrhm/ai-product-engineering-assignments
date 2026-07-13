import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    API_PORT: z.coerce.number().int().positive().default(8000),
    OPENAI_BASE_URL: z.url().default("https://api.openai.com/v1"),
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_MODEL: z.string().default("gpt-5.4"),
    WEB_ORIGIN: z.url().default("http://localhost:3000"),
  },
  runtimeEnv: process.env,
});
