import z from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().min(1).max(120),
  rawMaterial: z.string().trim().min(20).max(20_000),
  prerequisites: z.string().trim().min(1).max(2_000),
});

export const projectParamSchema = z.object({
  id: z.string().min(1),
});

export const chooseBeatSchema = z.object({
  candidateId: z.string().min(1),
});
