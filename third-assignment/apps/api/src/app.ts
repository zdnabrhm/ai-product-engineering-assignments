import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "./env.js";
import { apiError } from "./lib/api-error.js";
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

app.notFound((c) => apiError(c, 404, "ROUTE_NOT_FOUND", "Route not found"));

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return apiError(c, error.status, "HTTP_ERROR", error.message);
  }

  console.error(error);
  return apiError(c, 500, "INTERNAL_ERROR", "Internal server error");
});
