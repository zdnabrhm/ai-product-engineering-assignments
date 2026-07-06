import pino from "pino";
import { env } from "../utils/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: "ai-workout-plan",
  },
  redact: {
    paths: [
      "authorization",
      "cookie",
      "headers.authorization",
      "headers.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "*.apiKey",
      "*.password",
    ],
    remove: true,
  },
});
