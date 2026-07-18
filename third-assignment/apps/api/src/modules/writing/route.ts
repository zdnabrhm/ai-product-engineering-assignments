import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { chooseBeatSchema, createProjectSchema, projectParamSchema } from "./schema.js";
import {
  chooseWritingBeat,
  completeWritingProject,
  createWritingProject,
  getWritingProject,
  retryWritingProject,
} from "./service.js";

export const writingProjectRoute = new Hono()
  .post("/", zValidator("json", createProjectSchema), async (c) => {
    const project = await createWritingProject(c.req.valid("json"));
    return c.json(project, 202);
  })
  .get("/:id", zValidator("param", projectParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await getWritingProject(id));
  })
  .post(
    "/:id/choose",
    zValidator("param", projectParamSchema),
    zValidator("json", chooseBeatSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { candidateId } = c.req.valid("json");
      const project = await chooseWritingBeat(id, candidateId);
      return c.json(project, 202);
    },
  )
  .post("/:id/completed", zValidator("param", projectParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await completeWritingProject(id));
  })
  .post("/:id/retry", zValidator("param", projectParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await retryWritingProject(id), 202);
  });
