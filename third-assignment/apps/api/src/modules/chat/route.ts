import { createCompletionStream, type UIStreamRequest } from "@anvia/core";
import { Hono } from "hono";
import { model } from "../../lib/anvia.js";
import { createEventStream } from "@anvia/server";

export const chatRoute = new Hono().post("/", async (c) => {
  const body = await c.req.json<UIStreamRequest>();

  const stream = createCompletionStream(model, {
    messages: body.messages,
  });

  return createEventStream(stream, { format: "jsonl" });
});
