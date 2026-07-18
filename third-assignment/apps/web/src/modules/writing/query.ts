import { mutationOptions, queryOptions, type QueryClient } from "@tanstack/react-query";
import {
  chooseWritingBeat,
  completeWritingProject,
  createWritingProject,
  getWritingProject,
  retryWritingProject,
} from "./service";

export const writingProjectKeys = {
  all: ["writing-projects"] as const,
  details: () => [...writingProjectKeys.all, "detail"] as const,
  detail: (id: string) => [...writingProjectKeys.details(), id] as const,
};

function shouldPoll(status: string | undefined): boolean {
  return status === "QUEUED" || status === "GENERATING_BEATS";
}

export function writingProjectOptions(id: string) {
  return queryOptions({
    queryKey: writingProjectKeys.detail(id),
    queryFn: ({ signal }) => getWritingProject(id, signal),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return shouldPoll(status) ? 1000 : false;
    },
  });
}

function cacheWritingProject(
  queryClient: QueryClient,
  project: Awaited<ReturnType<typeof getWritingProject>>,
): void {
  queryClient.setQueryData(writingProjectKeys.detail(project.id), project);
}

export function createWritingProjectMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: [...writingProjectKeys.all, "create"] as const,
    mutationFn: createWritingProject,
    onSuccess: (project) => {
      cacheWritingProject(queryClient, project);
    },
  });
}

export function chooseWritingBeatMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: [...writingProjectKeys.all, "choose"] as const,
    mutationFn: chooseWritingBeat,
    onSuccess: (project) => {
      cacheWritingProject(queryClient, project);
    },
    onError: (_error, input) => {
      void queryClient.invalidateQueries({ queryKey: writingProjectKeys.detail(input.id) });
    },
  });
}

export function completeWritingProjectMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: [...writingProjectKeys.all, "complete"] as const,
    mutationFn: completeWritingProject,
    onSuccess: (project) => {
      cacheWritingProject(queryClient, project);
    },
    onError: (_error, id) => {
      void queryClient.invalidateQueries({ queryKey: writingProjectKeys.detail(id) });
    },
  });
}

export function retryWritingProjectMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: [...writingProjectKeys.all, "retry"] as const,
    mutationFn: retryWritingProject,
    onSuccess: (project) => {
      cacheWritingProject(queryClient, project);
    },
    onError: (_error, id) => {
      void queryClient.invalidateQueries({ queryKey: writingProjectKeys.detail(id) });
    },
  });
}
