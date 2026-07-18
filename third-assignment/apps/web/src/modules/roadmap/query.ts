import { mutationOptions, queryOptions, type QueryClient } from "@tanstack/react-query";
import {
  createRoadmap,
  deleteRoadmap,
  getRoadmap,
  listRoadmaps,
  retryRoadmap,
  type RoadmapSummary,
} from "./service";

export const roadmapKeys = {
  all: ["roadmaps"] as const,
  list: () => [...roadmapKeys.all, "list"] as const,
  detail: (id: string) => [...roadmapKeys.all, id] as const,
};

function isProcessing(status: string | undefined): boolean {
  return status === "QUEUED" || status === "PROCESSING";
}

export function roadmapsOptions() {
  return queryOptions({
    queryKey: roadmapKeys.list(),
    queryFn: ({ signal }) => listRoadmaps(signal),
    refetchInterval: (query) =>
      query.state.data?.some((roadmap) => isProcessing(roadmap.status)) ? 2_000 : false,
  });
}

export function roadmapOptions(id: string) {
  return queryOptions({
    queryKey: roadmapKeys.detail(id),
    queryFn: ({ signal }) => getRoadmap(id, signal),
    refetchInterval: (query) => (isProcessing(query.state.data?.status) ? 1_000 : false),
  });
}

export function createRoadmapMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: [...roadmapKeys.all, "create"] as const,
    mutationFn: createRoadmap,
    onSuccess: (roadmap) => {
      queryClient.setQueryData(roadmapKeys.detail(roadmap.id), roadmap);
      void queryClient.invalidateQueries({ queryKey: roadmapKeys.list(), exact: true });
    },
  });
}

export function retryRoadmapMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: [...roadmapKeys.all, "retry"] as const,
    mutationFn: retryRoadmap,
    onSuccess: (roadmap) => {
      queryClient.setQueryData(roadmapKeys.detail(roadmap.id), roadmap);
      void queryClient.invalidateQueries({ queryKey: roadmapKeys.list(), exact: true });
    },
    onError: (_error, id) => {
      void queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(id) });
    },
  });
}

export function deleteRoadmapMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: [...roadmapKeys.all, "delete"] as const,
    mutationFn: deleteRoadmap,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<RoadmapSummary[]>(roadmapKeys.list(), (roadmaps) =>
        roadmaps?.filter((roadmap) => roadmap.id !== id),
      );
      queryClient.removeQueries({ queryKey: roadmapKeys.detail(id), exact: true });
      void queryClient.invalidateQueries({ queryKey: roadmapKeys.list(), exact: true });
    },
  });
}
