import z from "zod";

export const roadmapCategorySchema = z.enum(["LEARNING", "CAREER", "EVENT", "PROJECT"]);

export const roadmapSourceSchema = z.object({
  id: z.string().regex(/^S\d+$/),
  title: z.string().min(1),
  url: z.url(),
  content: z.string().min(1),
});
export const roadmapSourcesSchema = z.array(roadmapSourceSchema).max(9);
export type RoadmapSource = z.infer<typeof roadmapSourceSchema>;

export const roadmapMilestoneSchema = z.object({
  id: z.string().regex(/^M\d+$/),
  title: z.string().min(1),
  objective: z.string().min(1),
  sourceIds: z.array(z.string().regex(/^S\d+$/)).min(1),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        successCriteria: z.string().min(1),
      }),
    )
    .min(2)
    .max(5),
});

export const roadmapResultSchema = z.object({
  overview: z.string().min(1),
  milestones: z.array(roadmapMilestoneSchema).min(3).max(5),
});
export type RoadmapResult = z.infer<typeof roadmapResultSchema>;

export const roadmapScopeSchema = z.object({
  supported: z.boolean(),
  reason: z.string(),
  queries: z.array(z.string().min(1)).max(3),
});
