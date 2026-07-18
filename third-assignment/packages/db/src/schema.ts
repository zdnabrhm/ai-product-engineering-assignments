import z from "zod";

export const groundedConceptsSchema = z.array(z.string());

export const beatCandidateSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  grounds: z.array(z.string()),
  preview: z.string().min(1),
});
export type BeatCandidate = z.infer<typeof beatCandidateSchema>;

export const beatCandidatesSchema = z.array(beatCandidateSchema);

export const generatedBeatCandidateSchema = beatCandidateSchema.omit({ id: true });

export const beatGenerationSchema = z.object({
  candidates: z.array(generatedBeatCandidateSchema).min(2).max(3),
  canFinish: z.boolean(),
  reason: z.string().describe("Why the article can finish now or why it needs another beat."),
});
export type BeatGeneration = z.infer<typeof beatGenerationSchema>;
