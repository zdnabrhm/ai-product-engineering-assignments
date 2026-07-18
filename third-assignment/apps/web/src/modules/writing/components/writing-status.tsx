import { IconCheck, IconClock, IconExclamationCircle } from "@tabler/icons-react";
import { Badge } from "@third-assignment/ui/components/badge";
import { Spinner } from "@third-assignment/ui/components/spinner";
import type { WritingProject } from "../service";

const statusLabels: Record<WritingProject["status"], string> = {
  QUEUED: "Preparing next step",
  GENERATING_BEATS: "Generating directions",
  WAITING_FOR_CHOICE: "Ready for your choice",
  COMPLETED: "Completed",
  FAILED: "Generation failed",
};

export function WritingStatus({ status }: { status: WritingProject["status"] }) {
  if (status === "QUEUED" || status === "GENERATING_BEATS") {
    return (
      <span
        className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground sm:text-sm"
        role="status"
        aria-live="polite"
      >
        <Spinner className="size-3.5" />
        <span className="hidden sm:inline">{statusLabels[status]}</span>
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <Badge variant="secondary">
        <IconCheck />
        {statusLabels[status]}
      </Badge>
    );
  }

  if (status === "FAILED") {
    return (
      <Badge variant="destructive">
        <IconExclamationCircle />
        {statusLabels[status]}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      <IconClock />
      <span className="hidden sm:inline">{statusLabels[status]}</span>
      <span className="sm:hidden">Ready</span>
    </Badge>
  );
}
