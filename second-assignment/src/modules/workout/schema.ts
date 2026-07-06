import z from "zod";

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

export const createWorkoutPlanInputSchema = z.object({
  goal: z.enum(["MUSCLE_GAIN", "STRENGTH", "FAT_LOSS", "GENERAL_FITNESS"]),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  daysPerWeek: z.coerce.number().int().min(2).max(6),
  sessionDurationMinutes: z.coerce.number().int().min(30).max(120),
  availableEquipment: z.array(z.string().trim().min(1).toLowerCase()).min(1),
  limitations: optionalTextSchema,
  preferences: optionalTextSchema,
});
export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanInputSchema>;

export const weeklySplitSchema = z.object({
  days: z
    .array(
      z.object({
        dayNumber: z.number().int().min(1).max(7),
        type: z.enum(["TRAINING", "REST"]),
        focus: z.string().nullable(),
        rationale: z.string(),
      }),
    )
    .length(7),
});
export type WeeklySplit = z.infer<typeof weeklySplitSchema>;

export const workoutExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().positive(),
  prescription: z.string(),
  restSeconds: z.number().int().min(15).max(300),
  notes: z.string().nullable(),
});

export const workoutDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  type: z.enum(["TRAINING", "REST"]),
  focus: z.string().nullable(),
  exercises: z.array(workoutExerciseSchema),
  dayNotes: z.string(),
});

export const workoutPlanSchema = z.object({
  title: z.string(),
  strategySummary: z.string(),
  days: z.array(workoutDaySchema).length(7),
  recoveryNotes: z.array(z.string()),
  generalNotes: z.array(z.string()),
});
export type WorkoutPlan = z.infer<typeof workoutPlanSchema>;

export const workoutReviewSchema = z.object({
  passed: z.boolean(),
  score: z.number().int().min(1).max(5),
  feedback: z.array(z.string()),
  revisionInstructions: z.array(z.string()),
});
export type WorkoutReview = z.infer<typeof workoutReviewSchema>;

export const workoutPlanIdSchema = z.object({
  id: z.cuid2(),
});
