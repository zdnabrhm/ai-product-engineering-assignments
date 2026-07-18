import { z } from "zod";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: {
    OPENAI_BASE_URL: z.url().default("https://api.openai.com/v1"),
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_MODEL: z.string().default("gpt-5.6-luna"),
    TAVILY_API_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
});
