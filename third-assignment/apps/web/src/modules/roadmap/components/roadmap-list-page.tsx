import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconBook2,
  IconBriefcase,
  IconCalendar,
  IconCalendarEvent,
  IconFolder,
  IconMap2,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@third-assignment/ui/components/alert";
import { Badge } from "@third-assignment/ui/components/badge";
import { Button } from "@third-assignment/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@third-assignment/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@third-assignment/ui/components/empty";
import { Skeleton } from "@third-assignment/ui/components/skeleton";
import { AppHeader } from "@/components/app-header";
import { roadmapsOptions } from "../query";
import type { RoadmapSummary } from "../service";
import { DeleteRoadmapDialog } from "./delete-roadmap-dialog";

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const CATEGORY_META = {
  LEARNING: { label: "Learning", icon: IconBook2 },
  CAREER: { label: "Career", icon: IconBriefcase },
  EVENT: { label: "Event", icon: IconCalendarEvent },
  PROJECT: { label: "Small project", icon: IconFolder },
} satisfies Record<RoadmapSummary["category"], { label: string; icon: typeof IconBook2 }>;

function formatTargetDate(value: string): string {
  return DATE_FORMATTER.format(new Date(`${value}T00:00:00.000Z`));
}

function formatCreatedAt(value: string): string {
  return DATE_FORMATTER.format(new Date(value));
}

function RoadmapStatusBadge({ status }: { status: RoadmapSummary["status"] }) {
  if (status === "COMPLETED") {
    return (
      <Badge
        variant="outline"
        className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
      >
        Ready
      </Badge>
    );
  }

  if (status === "PROCESSING") {
    return (
      <Badge
        variant="outline"
        className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
      >
        Building
      </Badge>
    );
  }

  if (status === "FAILED" || status === "REJECTED") {
    return (
      <Badge
        variant="outline"
        className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
      >
        {status === "FAILED" ? "Failed" : "Rejected"}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
    >
      Queued
    </Badge>
  );
}

function RoadmapListSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <Card key={item} className="h-full">
          <CardHeader>
            <div className="mb-4 flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="mt-auto">
            <Skeleton className="h-[54px] w-full rounded-lg" />
          </CardContent>
          <CardFooter className="justify-between gap-3">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function RoadmapCard({ roadmap }: { roadmap: RoadmapSummary }) {
  const category = CATEGORY_META[roadmap.category];
  const CategoryIcon = category.icon;

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CategoryIcon className="size-4" />
            {category.label}
          </div>
          <RoadmapStatusBadge status={roadmap.status} />
        </div>
        <CardTitle className="line-clamp-2 text-lg leading-snug">{roadmap.goal}</CardTitle>
        <CardDescription>Created {formatCreatedAt(roadmap.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
          <IconCalendar className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Target date</p>
            <p className="font-medium">{formatTargetDate(roadmap.targetDate)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <Button
          variant="ghost"
          render={
            <Link to="/roadmaps/$roadmapId" params={{ roadmapId: roadmap.id }} preload="intent" />
          }
          nativeButton={false}
        >
          View roadmap
          <IconArrowUpRight data-icon="inline-end" />
        </Button>
        <DeleteRoadmapDialog roadmapId={roadmap.id} goal={roadmap.goal} size="sm" />
      </CardFooter>
    </Card>
  );
}

export function RoadmapListPage() {
  const roadmapsQuery = useQuery(roadmapsOptions());

  return (
    <div className="min-h-dvh bg-muted/25">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
              <IconMap2 className="size-5" />
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Your Roadmaps
            </h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              Track every goal, jump back into the details, or clear out plans you no longer need.
            </p>
          </div>
          <Button render={<Link to="/roadmaps/new" />} nativeButton={false}>
            <IconPlus data-icon="inline-start" />
            Create roadmap
          </Button>
        </div>

        <div className="mt-10">
          {roadmapsQuery.isPending ? <RoadmapListSkeleton /> : null}

          {roadmapsQuery.isError ? (
            <Alert variant="destructive">
              <IconAlertTriangle />
              <AlertTitle>Could not load roadmaps</AlertTitle>
              <AlertDescription className="flex flex-col items-start gap-4">
                <p>Check the connection and try again.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={roadmapsQuery.isFetching}
                  onClick={() => void roadmapsQuery.refetch()}
                >
                  <IconRefresh data-icon="inline-start" />
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {roadmapsQuery.data?.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconMap2 />
                </EmptyMedia>
                <EmptyTitle>No roadmaps yet</EmptyTitle>
                <EmptyDescription>
                  Create your first research-backed roadmap and turn a goal into concrete steps.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button render={<Link to="/roadmaps/new" />} nativeButton={false}>
                  <IconPlus data-icon="inline-start" />
                  Create your first roadmap
                </Button>
              </EmptyContent>
            </Empty>
          ) : null}

          {roadmapsQuery.data && roadmapsQuery.data.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {roadmapsQuery.data.map((roadmap) => (
                <RoadmapCard key={roadmap.id} roadmap={roadmap} />
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
