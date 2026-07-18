import { createParsedCompletion } from "@anvia/core";
import { beatGenerationSchema, groundedConceptsSchema, prisma } from "@third-assignment/db";
import { writingJobSchema, type WritingJobData } from "@third-assignment/queue";
import type { Job } from "bullmq";
import { model } from "../lib/anvia.js";
import { randomUUID } from "node:crypto";

const INSTRUCTIONS = `
  You are helping an author build an article one beat at a time.

  A beat is one move in the article. It may set a scene, land one
  argument, introduce one idea, or change the angle. A beat must not
  try to do several unrelated jobs.

  Rules:
  - Generate 2 or 3 distinct candidate beats
  - Use only facts and claims supported by the raw material
  - A candidate may rely only on prerequisites or grounded concepts
  - Each candidate must state which new concepts it grounds
  - Do not write headings unless the beat naturally requires one
  - Do not repeat what the existing article already established
  - Keep each beat focused
  - canFinish should be false when the article is empty
  - canFinish may be true when the article already forms a complete journey
`;

export async function generateWritingBeats(job: Job<WritingJobData>): Promise<void> {
  const data = writingJobSchema.parse(job.data);

  const project = await prisma.writingProject.findUnique({ where: { id: data.projectId } });
  if (!project) return;

  // New job can't override the new one
  if (project.revision !== data.revision) return;

  if (project.status === "COMPLETED" || project.status === "WAITING_FOR_CHOICE") return;

  const claimed = await prisma.writingProject.updateMany({
    where: {
      id: project.id,
      revision: data.revision,
      status: {
        in: ["QUEUED", "FAILED", "GENERATING_BEATS"],
      },
    },
    data: {
      status: "GENERATING_BEATS",
      error: null,
    },
  });

  if (claimed.count === 0) return;

  try {
    const groundedConcepts = await groundedConceptsSchema.parse(project.groundedConcepts);

    const response = await createParsedCompletion(model, {
      instructions: INSTRUCTIONS,
      input: JSON.stringify({
        rawMaterial: project.rawMaterial,
        prerequisites: project.prerequisites,
        article: project.article.trim(),
        groundedConcepts,
      }),
      schema: beatGenerationSchema,
    });

    const candidates = response.data.candidates.map((candidate) => ({
      id: randomUUID(),
      ...candidate,
    }));

    await prisma.writingProject.updateMany({
      where: {
        id: project.id,
        revision: data.revision,
        status: "GENERATING_BEATS",
      },
      data: {
        candidates,
        canFinish: response.data.canFinish,
        generationNote: response.data.reason,
        status: "WAITING_FOR_CHOICE",
        error: null,
      },
    });
  } catch (error) {
    console.error("Failed to generate writing beats.", error);

    const maxAttempts = job.opts.attempts ?? 1;
    const isFinalAttempt = job.attemptsMade + 1 >= maxAttempts;

    await prisma.writingProject.updateMany({
      where: {
        id: project.id,
        revision: data.revision,
      },

      data: {
        status: isFinalAttempt ? "FAILED" : "QUEUED",
        error: isFinalAttempt ? "Failed to generate beats. You can retry the workflow." : null,
      },
    });

    throw error;
  }
}
