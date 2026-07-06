import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { logger } from "./lib/logger.js";
import { env } from "./utils/env.js";

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info({ component: "server", port: info.port }, "server started");
  },
);

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info({ component: "server", signal: "SIGINT" }, "server shutting down");
  server.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info({ component: "server", signal: "SIGTERM" }, "server shutting down");
  server.close((err) => {
    if (err) {
      logger.error({ err, component: "server" }, "server shutdown failed");
      process.exit(1);
    }
    process.exit(0);
  });
});
