import { parseResponse, type InferRequestType, type InferResponseType } from "hono/client";
import { api } from "@/lib/api";

const writingProjectsApi = api["writing-projects"];
const writingProjectApi = writingProjectsApi[":id"];

export type CreateWritingProjectInput = InferRequestType<typeof writingProjectsApi.$post>["json"];
export type WritingProject = InferResponseType<typeof writingProjectApi.$get, 200>;
export type ChooseWritingBeatInput = {
  id: string;
  candidateId: string;
};

export function createWritingProject(input: CreateWritingProjectInput): Promise<WritingProject> {
  return parseResponse(
    writingProjectsApi.$post({
      json: input,
    }),
  );
}

export function getWritingProject(id: string, signal?: AbortSignal): Promise<WritingProject> {
  return parseResponse(
    writingProjectApi.$get(
      {
        param: { id },
      },
      {
        init: { signal },
      },
    ),
  );
}

export function chooseWritingBeat({
  id,
  candidateId,
}: ChooseWritingBeatInput): Promise<WritingProject> {
  return parseResponse(
    writingProjectApi.choose.$post({
      param: { id },
      json: { candidateId },
    }),
  );
}

export function completeWritingProject(id: string): Promise<WritingProject> {
  return parseResponse(
    writingProjectApi.completed.$post({
      param: { id },
    }),
  );
}

export function retryWritingProject(id: string): Promise<WritingProject> {
  return parseResponse(
    writingProjectApi.retry.$post({
      param: { id },
    }),
  );
}
