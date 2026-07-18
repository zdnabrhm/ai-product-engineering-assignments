import { createFileRoute } from "@tanstack/react-router";
import { RoadmapDetailPage } from "@/modules/roadmap/components/roadmap-detail-page";
import { roadmapOptions } from "@/modules/roadmap/query";

export const Route = createFileRoute("/roadmaps/$roadmapId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(roadmapOptions(params.roadmapId)),
  component: RoadmapRoute,
});

function RoadmapRoute() {
  const { roadmapId } = Route.useParams();
  return <RoadmapDetailPage roadmapId={roadmapId} />;
}
