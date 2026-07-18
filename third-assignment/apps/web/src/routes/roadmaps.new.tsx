import { createFileRoute } from "@tanstack/react-router";
import { CreateRoadmapPage } from "@/modules/roadmap/components/create-roadmap-page";

export const Route = createFileRoute("/roadmaps/new")({
  component: CreateRoadmapPage,
});
