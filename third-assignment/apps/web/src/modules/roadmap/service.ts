import { parseResponse, type InferRequestType, type InferResponseType } from "hono/client";
import { api } from "@/lib/api";

const roadmapsApi = api.roadmaps;
const roadmapApi = roadmapsApi[":id"];

export type CreateRoadmapInput = InferRequestType<typeof roadmapsApi.$post>["json"];
export type RoadmapSummary = InferResponseType<typeof roadmapsApi.$get, 200>[number];
export type Roadmap = InferResponseType<typeof roadmapApi.$get, 200>;

export function listRoadmaps(signal?: AbortSignal): Promise<RoadmapSummary[]> {
  return parseResponse(roadmapsApi.$get({}, { init: { signal } }));
}

export function createRoadmap(input: CreateRoadmapInput): Promise<Roadmap> {
  return parseResponse(roadmapsApi.$post({ json: input }));
}

export function getRoadmap(id: string, signal?: AbortSignal): Promise<Roadmap> {
  return parseResponse(roadmapApi.$get({ param: { id } }, { init: { signal } }));
}

export function retryRoadmap(id: string): Promise<Roadmap> {
  return parseResponse(roadmapApi.retry.$post({ param: { id } }));
}

export function deleteRoadmap(id: string): Promise<void> {
  return parseResponse(roadmapApi.$delete({ param: { id } }));
}
