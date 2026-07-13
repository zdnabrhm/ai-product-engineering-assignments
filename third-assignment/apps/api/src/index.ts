import { serve } from "@hono/node-server";
import { disconnectDatabase, prisma } from "@third-assignment/db";
import { app } from "./app.js";
import { env } from "./env.js";
import { taskQueue } from "@third-assignment/queue/queue";

const server = serve({
  fetch: app.fetch,
  port: env.API_PORT,
});

let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;

  isShuttingDown = true;
  server.close();

  const results = await Promise.allSettled([taskQueue.close(), disconnectDatabase()]);

  if (results.some((result) => result.status === "rejected")) {
    console.error("Some resources failed to close:", results);
    process.exitCode = 1;
  }

  await prisma.$disconnect();
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
