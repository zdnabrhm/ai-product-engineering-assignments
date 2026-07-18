import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createRoadmapSchema, roadmapParamSchema } from "./schema.js";
import { createRoadmap, deleteRoadmap, getRoadmap, listRoadmaps, retryRoadmap } from "./service.js";

export const roadmapRoute = new Hono()
  .get("/", async (c) => {
    return c.json(await listRoadmaps());
  })
  .post("/", zValidator("json", createRoadmapSchema), async (c) => {
    return c.json(await createRoadmap(c.req.valid("json")), 202);
  })
  .get("/:id", zValidator("param", roadmapParamSchema), async (c) => {
    return c.json(await getRoadmap(c.req.valid("param").id));
  })
  .post("/:id/retry", zValidator("param", roadmapParamSchema), async (c) => {
    return c.json(await retryRoadmap(c.req.valid("param").id), 202);
  })
  .delete("/:id", zValidator("param", roadmapParamSchema), async (c) => {
    await deleteRoadmap(c.req.valid("param").id);
    return c.body(null, 204);
  });
