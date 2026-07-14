import { Hono } from "hono";
import { env } from "./env.js";
import { cors } from "hono/cors";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: env.WEB_ORIGIN,
  }),
);

app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Hello World",
  });
});

app.get("/health", (c) => c.json({ status: "ok" }));
