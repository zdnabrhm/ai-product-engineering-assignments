import z from "zod";
import { roadmapCategorySchema } from "@third-assignment/db";

function isTargetDateWithinRange(targetDate: Date): boolean {
  const min = new Date();
  min.setUTCHours(0, 0, 0, 0);

  const max = new Date(min);
  min.setUTCDate(min.getUTCDate() + 7);
  max.setUTCDate(max.getUTCDate() + 365);

  return targetDate >= min && targetDate <= max;
}

export const createRoadmapSchema = z.object({
  category: roadmapCategorySchema,
  goal: z.string().trim().min(10).max(500),
  currentSituation: z.string().trim().min(10).max(2_000),
  targetDate: z.iso.date().pipe(z.coerce.date()).refine(isTargetDateWithinRange, {
    message: "Target date must be between 7 and 365 days from today.",
  }),
  constraints: z.string().trim().min(1).max(2_000),
});

export const roadmapParamSchema = z.object({
  id: z.string().min(1),
});
