import z from "zod";

export const TASK_QUEUE_NAME = "background-tasks";
export const TASK_JOB_NAME = "example-task";

export const taskJobSchema = z.object({
  resourceId: z.string().min(1),
});
export type TaskJobData = z.infer<typeof taskJobSchema>;
