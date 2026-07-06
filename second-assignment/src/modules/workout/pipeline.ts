import { createParsedCompletion } from "@anvia/core";
import { exercises, type Exercise, type ExperienceLevel } from "../../data/exercises.js";
import { getModel } from "../../lib/anvia.js";
import {
  weeklySplitSchema,
  workoutPlanSchema,
  workoutReviewSchema,
  type CreateWorkoutPlanInput,
  type WorkoutPlan,
} from "./schema.js";

const experienceRank: Record<ExperienceLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
};

function getAvailableExercises(input: CreateWorkoutPlanInput): Exercise[] {
  const availableEquipment = new Set([...input.availableEquipment, "bodyweight"]);

  return exercises.filter(
    (exercise) =>
      experienceRank[exercise.minExperienceLevel] <= experienceRank[input.experienceLevel] &&
      exercise.equipment.every((equipment) => availableEquipment.has(equipment)),
  );
}

export async function runWorkoutPlanPipeline(input: CreateWorkoutPlanInput): Promise<WorkoutPlan> {
  const exerciseCatalog = getAvailableExercises(input);

  if (exerciseCatalog.length < 6) {
    throw new Error("Not enough exercises match the available equipment and experience level.");
  }

  const context = {
    profile: input,
    exerciseCatalog,
  };

  const split = await createParsedCompletion(getModel(), {
    instructions: `
      You are a workout program planner.
      Design a practical seven-day training split for the supplied profile.

      Requirements:
      - Return exactly seven ordered days, numbered 1 through 7
      - Use exactly profile.daysPerWeek TRAINING days
      - Mark every other day as REST
      - Balance training stress and recovery
      - A REST day must have focus=null
      - Do not prescribe exercises yet
    `,
    input: JSON.stringify(context),
    schema: weeklySplitSchema,
  });

  let plan = await createParsedCompletion(getModel(), {
    instructions: `
      You are a practical strength and conditioning coach.
      Turn the weekly split into a complete one-week workout plan.

      Requirements:
      - Follow the weekly split exactly
      - Use only exerciseId values from exerciseCatalog
      - REST days must have an empty exercises array
      - TRAINING days must contain realistic exercise volume for the session duration
      - Each prescription must be human-readable, for example "8-10 reps" or "30 seconds"
      - Respect the profile goal, experience, limitations, preferences, and equipment
      - Do not make medical claims
    `,
    input: JSON.stringify({ ...context, weeklySplit: split.data }),
    schema: workoutPlanSchema,
  });

  const review = await createParsedCompletion(getModel(), {
    instructions: `
      You are reviewing a one-week workout plan.

      Pass it only when all four criteria are satisfied:
      1. It matches the goal and experience level
      2. Each training day is feasible within the requested session duration
      3. Recovery between training days is reasonable
      4. It respects available equipment, preferences, and limitations

      Give concrete revision instructions when it fails.
      Do not claim that the plan is medically safe.
    `,
    input: JSON.stringify({ ...context, workoutPlan: plan.data }),
    schema: workoutReviewSchema,
  });

  if (!review.data.passed) {
    plan = await createParsedCompletion(getModel(), {
      instructions: `
        You are the workout coach revising a plan after quality review.
        Apply every revision instruction while preserving the required seven-day structure.
        Use only exerciseId values from exerciseCatalog.
        Return the complete revised plan, not a patch or explanation.
      `,
      input: JSON.stringify({
        ...context,
        weeklySplit: split.data,
        previousPlan: plan.data,
        review: review.data,
      }),
      schema: workoutPlanSchema,
    });
  }

  return plan.data;
}
