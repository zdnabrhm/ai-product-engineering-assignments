import { createFileRoute } from "@tanstack/react-router";
import { WritingWorkspacePage } from "@/modules/writing/components/writing-workspace-page";
import { writingProjectOptions } from "@/modules/writing/query";

export const Route = createFileRoute("/writing/$projectId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(writingProjectOptions(params.projectId)),
  component: WritingProjectRoute,
});

function WritingProjectRoute() {
  const { projectId } = Route.useParams();
  return <WritingWorkspacePage projectId={projectId} />;
}
