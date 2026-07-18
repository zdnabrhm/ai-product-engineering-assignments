import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconExternalLink,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@third-assignment/ui/components/alert";
import { Badge } from "@third-assignment/ui/components/badge";
import { Button, buttonVariants } from "@third-assignment/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@third-assignment/ui/components/card";
import { Skeleton } from "@third-assignment/ui/components/skeleton";
import { Spinner } from "@third-assignment/ui/components/spinner";
import { AppHeader } from "@/components/app-header";
import { roadmapOptions, retryRoadmapMutationOptions } from "../query";
import type { Roadmap } from "../service";
import { DeleteRoadmapDialog } from "./delete-roadmap-dialog";

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const CATEGORY_LABELS: Record<Roadmap["category"], string> = {
  LEARNING: "Learning",
  CAREER: "Career",
  EVENT: "Event",
  PROJECT: "Small project",
};

function formatDate(value: string): string {
  return DATE_FORMATTER.format(new Date(`${value}T00:00:00.000Z`));
}

function formatCitationId(value: string): string {
  return `[${value.slice(1)}]`;
}

function ProcessingState({ status }: { status: "QUEUED" | "PROCESSING" }) {
  return (
    <div className="mx-auto max-w-3xl py-16 text-center sm:py-24">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
        <Spinner className="size-5" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        {status === "QUEUED"
          ? "Your roadmap is queued."
          : "Researching and building your roadmap..."}
      </h1>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-balance text-muted-foreground">
        The worker is gathering sources, planning milestones, and turning them into concrete steps.
      </p>
      <div className="mx-auto mt-10 max-w-xl space-y-3 text-left">
        {[0, 1, 2].map((item) => (
          <Card key={item}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-6 w-2/3" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RejectedState({ roadmap }: { roadmap: Roadmap }) {
  return (
    <div className="mx-auto max-w-2xl py-16 sm:py-24">
      <Alert>
        <IconAlertTriangle />
        <AlertTitle>This goal is outside the supported scope</AlertTitle>
        <AlertDescription className="flex flex-col gap-5">
          <p>
            {roadmap.rejectionReason ?? "Try a learning, career, event, or small-project goal."}
          </p>
          <Link to="/roadmaps/new" className={buttonVariants({ className: "w-fit" })}>
            Create a different roadmap
            <IconArrowRight data-icon="inline-end" />
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function FailedState({ roadmap }: { roadmap: Roadmap }) {
  const queryClient = useQueryClient();
  const retry = useMutation(retryRoadmapMutationOptions(queryClient));

  return (
    <div className="mx-auto max-w-2xl py-16 sm:py-24">
      <Alert variant="destructive">
        <IconAlertTriangle />
        <AlertTitle>Roadmap generation failed</AlertTitle>
        <AlertDescription className="flex flex-col gap-5">
          <p>{roadmap.error ?? "The providers did not complete the roadmap."}</p>
          <Button
            className="w-fit"
            disabled={retry.isPending}
            onClick={() => retry.mutate(roadmap.id)}
          >
            {retry.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <IconRefresh data-icon="inline-start" />
            )}
            {retry.isPending ? "Retrying…" : "Retry generation"}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function CompletedRoadmap({ roadmap }: { roadmap: Roadmap }) {
  if (!roadmap.result) return null;

  const sourcesById = new Map(roadmap.sources.map((source) => [source.id, source]));

  return (
    <div className="mx-auto max-w-4xl py-10 sm:py-16">
      <div className="max-w-3xl">
        <div className="flex flex-wrap gap-2">
          <Badge>{CATEGORY_LABELS[roadmap.category]}</Badge>
          <Badge variant="secondary">Research-backed</Badge>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          {roadmap.goal}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">{roadmap.result.overview}</p>
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <IconCalendar className="size-4" />
          Target {formatDate(roadmap.targetDate)}
        </div>
      </div>

      <div className="mt-12 space-y-5">
        {roadmap.result.milestones.map((milestone, index) => (
          <Card key={milestone.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="outline">Milestone {index + 1}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(milestone.startDate)} – {formatDate(milestone.endDate)}
                </span>
              </div>
              <CardTitle className="mt-2 text-xl">{milestone.title}</CardTitle>
              <CardDescription className="leading-6">{milestone.objective}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {milestone.tasks.map((task, taskIndex) => (
                  <li
                    key={`${milestone.id}-${taskIndex}`}
                    className="grid grid-cols-[1.75rem_1fr] gap-3"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {taskIndex + 1}
                    </span>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {task.description}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-medium">Done when:</span> {task.successCriteria}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                {milestone.sourceIds.map((sourceId) => {
                  const source = sourcesById.get(sourceId);
                  return source ? (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Source ${formatCitationId(source.id)}: ${source.title}`}
                      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      {formatCitationId(source.id)}
                      <IconExternalLink className="size-3" />
                    </a>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-12 border-t pt-10">
        <h2 className="text-2xl font-semibold tracking-tight">Sources</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {roadmap.sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {formatCitationId(source.id)}
              </p>
              <p className="mt-2 text-sm leading-6 font-medium">{source.title}</p>
            </a>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <Link to="/roadmaps/new" className={buttonVariants()}>
          <IconPlus data-icon="inline-start" />
          Create new roadmap
        </Link>
      </div>
    </div>
  );
}

function RoadmapState({ roadmap }: { roadmap: Roadmap }) {
  if (roadmap.status === "QUEUED" || roadmap.status === "PROCESSING") {
    return <ProcessingState status={roadmap.status} />;
  }
  if (roadmap.status === "REJECTED") return <RejectedState roadmap={roadmap} />;
  if (roadmap.status === "FAILED") return <FailedState roadmap={roadmap} />;
  return <CompletedRoadmap roadmap={roadmap} />;
}

export function RoadmapDetailPage({ roadmapId }: { roadmapId: string }) {
  const navigate = useNavigate();
  const roadmapQuery = useQuery(roadmapOptions(roadmapId));

  if (roadmapQuery.isPending) {
    return (
      <div className="min-h-dvh bg-muted/25">
        <AppHeader />
        <main className="px-5 sm:px-8">
          <ProcessingState status="QUEUED" />
        </main>
      </div>
    );
  }

  if (roadmapQuery.isError) {
    return (
      <div className="min-h-dvh bg-muted/25">
        <AppHeader />
        <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
          <Alert variant="destructive">
            <IconAlertTriangle />
            <AlertTitle>Could not load this roadmap</AlertTitle>
            <AlertDescription>
              Check the link or return home and create a new roadmap.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const roadmap = roadmapQuery.data;
  return (
    <div className="min-h-dvh bg-muted/25">
      <AppHeader />
      <main className="px-5 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between pt-6">
          <Link to="/roadmaps" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <IconArrowLeft data-icon="inline-start" />
            Roadmaps
          </Link>
          <DeleteRoadmapDialog
            roadmapId={roadmap.id}
            goal={roadmap.goal}
            size="sm"
            onDeleted={() => navigate({ to: "/roadmaps" })}
          />
        </div>
        <RoadmapState roadmap={roadmap} />
      </main>
    </div>
  );
}
