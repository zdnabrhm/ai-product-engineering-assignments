import z from "zod";

export const WRITING_QUEUE_NAME = "writing-beats";
export const WRITING_JOB_NAME = "generate-beats";

export const writingJobSchema = z.object({
  projectId: z.string().min(1),
  revision: z.number().int().nonnegative(),
});
export type WritingJobData = z.infer<typeof writingJobSchema>;
