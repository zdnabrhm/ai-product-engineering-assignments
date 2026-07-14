import { Hono } from "hono";
import { env } from "./env.js";
import { cors } from "hono/cors";
import { chatRoute } from "./modules/chat/route.js";

export const app = new Hono()
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
  .route("/chat", chatRoute);
