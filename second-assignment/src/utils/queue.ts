import { Queue } from "bullmq";
import { connection, WORKOUT_PLAN_QUEUE_NAME } from "../lib/bullmq.js";

export interface WorkoutPlanJobData {
  planId: string;
}

export const workoutPlanQueue = new Queue<WorkoutPlanJobData>(WORKOUT_PLAN_QUEUE_NAME, {
  connection,
});
