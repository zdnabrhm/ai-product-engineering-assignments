import { createFileRoute } from "@tanstack/react-router";
import { RoadmapListPage } from "@/modules/roadmap/components/roadmap-list-page";
import { roadmapsOptions } from "@/modules/roadmap/query";

export const Route = createFileRoute("/roadmaps/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(roadmapsOptions()),
  component: RoadmapListPage,
});
