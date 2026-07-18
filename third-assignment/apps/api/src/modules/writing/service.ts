import {
  beatCandidatesSchema,
  groundedConceptsSchema,
  prisma,
  type WritingProject,
} from "@third-assignment/db";
import { WRITING_JOB_NAME, writingQueue, type WritingJobData } from "@third-assignment/queue";
import { HTTPException } from "hono/http-exception";

export type CreateWritingProjectInput = {
  title: string;
  rawMaterial: string;
  prerequisites: string;
};

async function enqueueWritingProject(data: WritingJobData) {
  await writingQueue.add(WRITING_JOB_NAME, data, {
    jobId: `writing-${data.projectId}-${data.revision}`,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1_000,
    },
    removeOnComplete: 100,
    removeOnFail: true,
  });
}

function serializeProject(project: WritingProject) {
  return {
    id: project.id,
    title: project.title,
    rawMaterial: project.rawMaterial,
    prerequisites: project.prerequisites,
    article: project.article,
    groundedConcepts: groundedConceptsSchema.parse(project.groundedConcepts),
    candidates: beatCandidatesSchema.parse(project.candidates),
    status: project.status,
    revision: project.revision,
    canFinish: project.canFinish,
    generationNote: project.generationNote,
    error: project.error,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function createWritingProject(input: CreateWritingProjectInput) {
  const project = await prisma.writingProject.create({
    data: {
      ...input,
      groundedConcepts: [],
      candidates: [],
    },
  });

  try {
    await enqueueWritingProject({
      projectId: project.id,
      revision: project.revision,
    });
  } catch (cause) {
    console.error("Failed to enqueue writing project:", cause);

    await prisma.writingProject.update({
      where: { id: project.id },
      data: {
        status: "FAILED",
        error: "Could not enqueue the writing workflow.",
      },
    });

    throw new HTTPException(503, {
      message: "Could not start the writing workflow.",
      cause,
    });
  }

  return serializeProject(project);
}

export async function getWritingProject(id: string) {
  const project = await prisma.writingProject.findUnique({
    where: { id },
  });

  if (!project) {
    throw new HTTPException(404, {
      message: "Writing project not found.",
    });
  }

  return serializeProject(project);
}

export async function chooseWritingBeat(id: string, candidateId: string) {
  const project = await prisma.writingProject.findUnique({
    where: { id },
  });

  if (!project) {
    throw new HTTPException(404, {
      message: "Writing project not found.",
    });
  }

  if (project.status !== "WAITING_FOR_CHOICE") {
    throw new HTTPException(409, {
      message: "This project is not waiting for a choice.",
    });
  }

  const candidates = beatCandidatesSchema.parse(project.candidates);
  const candidate = candidates.find((item) => item.id === candidateId);

  if (!candidate) {
    throw new HTTPException(404, {
      message: "Beat candidate not found.",
    });
  }

  const groundedConcepts = groundedConceptsSchema.parse(project.groundedConcepts);
  const nextGroundedConcepts = [...new Set([...groundedConcepts, ...candidate.grounds])];
  const nextArticle = project.article.trim()
    ? `${project.article.trim()}\n\n${candidate.text.trim()}`
    : candidate.text.trim();
  const nextRevision = project.revision + 1;

  const updated = await prisma.writingProject.updateMany({
    where: {
      id: project.id,
      revision: project.revision,
      status: "WAITING_FOR_CHOICE",
    },
    data: {
      article: nextArticle,
      groundedConcepts: nextGroundedConcepts,
      candidates: [],
      revision: nextRevision,
      status: "QUEUED",
      canFinish: false,
      generationNote: null,
      error: null,
    },
  });

  if (updated.count === 0) {
    throw new HTTPException(409, {
      message: "Project changed before the beat was applied.",
    });
  }

  try {
    await enqueueWritingProject({
      projectId: project.id,
      revision: nextRevision,
    });
  } catch (cause) {
    console.error("Failed to enqueue next writing step:", cause);

    await prisma.writingProject.update({
      where: { id: project.id },
      data: {
        status: "FAILED",
        error: "The beat was saved, but the next step could not start.",
      },
    });

    throw new HTTPException(503, {
      message: "The beat was saved, but generation could not continue.",
      cause,
    });
  }

  const nextProject = await prisma.writingProject.findUniqueOrThrow({
    where: { id: project.id },
  });

  return serializeProject(nextProject);
}

export async function completeWritingProject(id: string) {
  const updated = await prisma.writingProject.updateMany({
    where: {
      id,
      status: "WAITING_FOR_CHOICE",
      article: {
        not: "",
      },
    },
    data: {
      status: "COMPLETED",
      candidates: [],
    },
  });

  if (updated.count === 0) {
    throw new HTTPException(409, {
      message: "Project cannot be completed in its current state.",
    });
  }

  const project = await prisma.writingProject.findUniqueOrThrow({
    where: { id },
  });

  return serializeProject(project);
}

export async function retryWritingProject(id: string) {
  const project = await prisma.writingProject.findUnique({
    where: { id },
  });

  if (!project) {
    throw new HTTPException(404, {
      message: "Writing project not found.",
    });
  }

  if (project.status !== "FAILED") {
    throw new HTTPException(409, {
      message: "Only failed projects can be retried.",
    });
  }

  await prisma.writingProject.update({
    where: { id },
    data: {
      status: "QUEUED",
      error: null,
    },
  });

  try {
    await enqueueWritingProject({
      projectId: id,
      revision: project.revision,
    });
  } catch (cause) {
    console.error("Failed to retry writing project:", cause);

    await prisma.writingProject.update({
      where: { id },
      data: {
        status: "FAILED",
        error: "Could not enqueue the retry.",
      },
    });

    throw new HTTPException(503, {
      message: "Could not retry the workflow.",
      cause,
    });
  }

  const nextProject = await prisma.writingProject.findUniqueOrThrow({
    where: { id },
  });

  return serializeProject(nextProject);
}
