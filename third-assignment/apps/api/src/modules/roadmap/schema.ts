import z from "zod";
import { roadmapCategorySchema } from "@third-assignment/db";

const DAY_MS = 86_400_000;

export const createRoadmapSchema = z
  .object({
    category: roadmapCategorySchema,
    goal: z.string().trim().min(10).max(500),
    currentSituation: z.string().trim().min(10).max(2_000),
    targetDate: z.iso.date(),
    constraints: z.string().trim().min(1).max(2_000),
  })
  .superRefine((input, context) => {
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const targetUtc = Date.parse(`${input.targetDate}T00:00:00.000Z`);
    const daysAway = Math.round((targetUtc - todayUtc) / DAY_MS);

    if (daysAway < 7 || daysAway > 365) {
      context.addIssue({
        code: "custom",
        path: ["targetDate"],
        message: "Target date must be between 7 and 365 days from today.",
      });
    }
  });

export const roadmapParamSchema = z.object({
  id: z.string().min(1),
});
