import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/roadmaps")({
  component: RoadmapsLayout,
});

function RoadmapsLayout() {
  return <Outlet />;
}
