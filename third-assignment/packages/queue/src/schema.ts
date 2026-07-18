import z from "zod";

export const ROADMAP_QUEUE_NAME = "roadmaps";
export const ROADMAP_JOB_NAME = "generate-roadmap";

export const roadmapJobSchema = z.object({
  roadmapId: z.string().min(1),
});
export type RoadmapJobData = z.infer<typeof roadmapJobSchema>;
