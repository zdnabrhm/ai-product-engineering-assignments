import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "./env.js";
import { cors } from "hono/cors";
import { chatRoute } from "./modules/chat/route.js";
import { roadmapRoute } from "./modules/roadmap/route.js";

export const app = new Hono()
  .onError((error, c) => {
    if (error instanceof HTTPException) {
      return c.json({ error: error.message }, error.status);
    }

    console.error(error);
    return c.json({ error: "Internal server error." }, 500);
  })
  .use(
    "*",
    cors({
      origin: env.WEB_ORIGIN,
    }),
  )
  .get("/", (c) => {
    return c.json({
      status: "ok",
      message: "Hello World",
    });
  })
  .get("/health", (c) => c.json({ status: "ok" }))
  .route("/chat", chatRoute)
  .route("/roadmaps", roadmapRoute);

export type AppType = typeof app;
