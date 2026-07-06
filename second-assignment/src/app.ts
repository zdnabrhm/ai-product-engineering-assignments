import { structuredLogger } from "@hono/structured-logger";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import type { Logger } from "pino";
import { logger } from "./lib/logger.js";
import { workoutPlanRouter } from "./modules/workout/router.js";
import { apiError } from "./utils/http.js";

type AppEnv = {
  Variables: {
    logger: Logger;
    requestId: string;
  };
};

export const app = new Hono<AppEnv>()
  .use(requestId())
  .use(
    structuredLogger({
      createLogger: (c) => logger.child({ requestId: c.var.requestId, component: "http" }),
      onRequest: () => undefined,
      onResponse: (requestLogger, c, elapsedMs) => {
        requestLogger.info(
          {
            method: c.req.method,
            path: c.req.path,
            status: c.res.status,
            elapsedMs,
          },
          "request completed",
        );
      },
      onError: (requestLogger, err, c) => {
        requestLogger.error(
          {
            err,
            method: c.req.method,
            path: c.req.path,
            status: c.res.status,
          },
          "request failed",
        );
      },
    }),
  )
  .get("/health", (c) => {
    return c.json(
      {
        name: "AI Workout Plan API",
        status: "ok",
      },
      200,
    );
  })
  .route("/workout-plans", workoutPlanRouter);

app.notFound((c) => {
  return c.json(apiError("NOT_FOUND", "Endpoint not found."), 404);
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json(apiError("VALIDATION_ERROR", error.message), error.status);
  }

  return c.json(apiError("INTERNAL_ERROR", "Internal server error."), 500);
});

export type AppType = typeof app;
