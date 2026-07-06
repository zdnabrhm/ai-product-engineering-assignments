import { readFile } from "node:fs/promises";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { apiError, validationError } from "../../utils/http.js";
import { createWorkoutPlanInputSchema, workoutPlanIdSchema } from "./schema.js";
import { createWorkoutPlan, getWorkoutPlan, getWorkoutPlanPdf } from "./services.js";

const validateBody = zValidator("json", createWorkoutPlanInputSchema, (result, c) => {
  if (!result.success) {
    return validationError(result, c);
  }
});

const validateId = zValidator("param", workoutPlanIdSchema, (result, c) => {
  if (!result.success) {
    return validationError(result, c);
  }
});

export const workoutPlanRouter = new Hono()
  .post("/", validateBody, async (c) => {
    const plan = await createWorkoutPlan(c.req.valid("json"));
    const statusUrl = `/workout-plans/${plan.id}`;

    return c.json({ ...plan, statusUrl }, 202);
  })
  .get("/:id", validateId, async (c) => {
    const plan = await getWorkoutPlan(c.req.valid("param").id);

    if (!plan) {
      return c.json(apiError("PLAN_NOT_FOUND", "Workout plan not found."), 404);
    }

    return c.json(plan, 200);
  })
  .get("/:id/pdf", validateId, async (c) => {
    const { id } = c.req.valid("param");
    const pdf = await getWorkoutPlanPdf(id);

    if (pdf.state === "NOT_FOUND") {
      return c.json(apiError("PLAN_NOT_FOUND", "Workout plan not found."), 404);
    }

    if (pdf.state === "FAILED") {
      return c.json(apiError("PLAN_GENERATION_FAILED", "Workout plan generation failed."), 409);
    }

    if (pdf.state === "NOT_READY") {
      return c.json(apiError("PLAN_NOT_READY", "Workout plan PDF is not ready."), 409);
    }

    const file = new Uint8Array(await readFile(pdf.path));

    return c.body(file, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="workout-plan-${id}.pdf"`,
      "Content-Length": file.byteLength.toString(),
    });
  });

export type WorkoutPlanRouter = typeof workoutPlanRouter;
