import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconRefresh,
  IconTargetArrow,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@third-assignment/ui/components/alert";
import { Badge } from "@third-assignment/ui/components/badge";
import { Button } from "@third-assignment/ui/components/button";
import { Skeleton } from "@third-assignment/ui/components/skeleton";
import { Spinner } from "@third-assignment/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@third-assignment/ui/components/toggle-group";
import { cn } from "@third-assignment/ui/lib/utils";
import { chooseWritingBeatMutationOptions, writingProjectOptions } from "../query";
import type { WritingProject } from "../service";
import { getErrorMessage } from "../error-message";
import { ArticleView } from "./article-view";
import { CandidatePanel } from "./candidate-panel";
import { SourceContext } from "./source-context";
import { WritingAppHeader } from "./writing-app-header";
import { WritingStatus } from "./writing-status";

type WorkspaceTab = "draft" | "directions";
type BeatCandidate = WritingProject["candidates"][number];

function WritingWorkspaceSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/20 lg:h-dvh lg:overflow-hidden">
      <WritingAppHeader
        trailing={
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-3.5" />
            <span className="hidden sm:inline">Opening project…</span>
          </span>
        }
      />
      <main className="flex-1 lg:grid lg:min-h-0 lg:grid-cols-[25rem_minmax(0,1fr)]">
        <aside className="border-r bg-background px-5 py-8 sm:px-8 lg:overflow-y-auto lg:px-7">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-8 w-56" />
          <div className="mt-8 flex flex-col gap-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </aside>
        <section className="px-5 py-8 sm:px-8 sm:py-12 lg:overflow-y-auto lg:px-12">
          <div className="mx-auto w-full max-w-[58rem]">
            <Skeleton className="mb-6 h-52 w-full rounded-2xl" />
            <div className="rounded-2xl border bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-12">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-8 h-10 w-4/5" />
              <div className="mt-10 flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[94%]" />
                <Skeleton className="h-4 w-[88%]" />
                <Skeleton className="h-4 w-[96%]" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function MobileWorkspaceTabs({
  value,
  directionCount,
  onChange,
}: {
  value: WorkspaceTab;
  directionCount: number;
  onChange: (value: WorkspaceTab) => void;
}) {
  return (
    <ToggleGroup
      aria-label="Workspace view"
      value={[value]}
      spacing={1}
      className="sticky top-16 z-20 grid w-full grid-cols-2 rounded-none border-b bg-background/95 p-2 backdrop-blur-xl lg:hidden"
      onValueChange={([nextValue]) => {
        if (nextValue === "draft" || nextValue === "directions") {
          onChange(nextValue);
        }
      }}
    >
      <ToggleGroupItem value="draft" className="w-full">
        Draft
      </ToggleGroupItem>
      <ToggleGroupItem value="directions" className="w-full">
        Directions <span className="opacity-55">({directionCount})</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function ProposedBeat({
  candidate,
  isApplying,
  error,
  onApply,
}: {
  candidate: BeatCandidate;
  isApplying: boolean;
  error: unknown;
  onApply: () => void;
}) {
  return (
    <section className="mb-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Proposed next beat
          </p>
          <p className="mt-2 text-lg leading-7 font-semibold">{candidate.preview}</p>
        </div>
        <Button disabled={isApplying} onClick={onApply}>
          {isApplying ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <IconCheck data-icon="inline-start" />
          )}
          {isApplying ? "Applying beat…" : "Apply this direction"}
        </Button>
      </div>

      {Boolean(error) && (
        <Alert variant="destructive" className="mt-5">
          <IconAlertTriangle />
          <AlertTitle>Could not apply that beat</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error, "The project changed before the beat was applied.")}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-5 grid gap-5 border-t pt-5 md:grid-cols-[minmax(0,1fr)_15rem]">
        <p className="text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
          {candidate.text}
        </p>
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            <IconTargetArrow className="size-4" /> Evidence
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {candidate.grounds.map((ground) => (
              <Badge key={ground} variant="secondary" className="h-auto min-h-6 whitespace-normal">
                {ground}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WritingWorkspaceContent({ project }: { project: WritingProject }) {
  const queryClient = useQueryClient();
  const chooseBeat = useMutation(chooseWritingBeatMutationOptions(queryClient));
  const [tab, setTab] = useState<WorkspaceTab>(
    project.status === "COMPLETED" ? "draft" : "directions",
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>(
    project.candidates[0]?.id,
  );

  const selectedCandidate =
    project.candidates.find((candidate) => candidate.id === selectedCandidateId) ??
    project.candidates[0];
  const isCompleted = project.status === "COMPLETED";
  const applyingCandidateId = chooseBeat.variables?.candidateId;

  return (
    <div className="flex min-h-dvh flex-col bg-muted/20 lg:h-dvh lg:overflow-hidden">
      <WritingAppHeader
        title={project.title}
        trailing={<WritingStatus status={project.status} />}
      />
      <MobileWorkspaceTabs
        value={tab}
        directionCount={project.candidates.length}
        onChange={setTab}
      />
      <main className="flex-1 lg:grid lg:min-h-0 lg:grid-cols-[25rem_minmax(0,1fr)]">
        <aside
          className={cn(
            "border-r bg-background px-5 py-7 sm:px-8 lg:block lg:overflow-y-auto lg:px-7",
            tab !== "directions" && "hidden",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                {isCompleted ? "Project complete" : "Decision queue"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {isCompleted ? "Share the result" : "What comes next?"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isCompleted
                  ? "Copy or download the final article when you are ready."
                  : "Select a direction, review the full beat beside the draft, then apply it."}
              </p>
            </div>
            {!isCompleted && (
              <span className="shrink-0 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                Beat {project.revision + 1}
              </span>
            )}
          </div>

          <div className="mt-7" aria-live="polite" aria-atomic="false">
            <CandidatePanel
              project={project}
              selectedCandidateId={selectedCandidate?.id}
              applyingCandidateId={applyingCandidateId}
              isChoosing={chooseBeat.isPending}
              onSelectCandidate={setSelectedCandidateId}
            />
          </div>

          <div className="mt-7">
            <SourceContext project={project} compact />
          </div>
        </aside>

        <section
          className={cn(
            "px-5 py-8 sm:px-8 sm:py-12 lg:block lg:overflow-y-auto lg:px-12 lg:py-14",
            tab !== "draft" && "hidden",
          )}
        >
          <div className="mx-auto w-full max-w-[58rem]">
            {project.status === "WAITING_FOR_CHOICE" && selectedCandidate && (
              <ProposedBeat
                candidate={selectedCandidate}
                isApplying={chooseBeat.isPending && applyingCandidateId === selectedCandidate.id}
                error={chooseBeat.error}
                onApply={() =>
                  chooseBeat.mutate({ id: project.id, candidateId: selectedCandidate.id })
                }
              />
            )}
            <ArticleView project={project} />
          </div>
        </section>
      </main>
    </div>
  );
}

export function WritingWorkspacePage({ projectId }: { projectId: string }) {
  const projectQuery = useQuery(writingProjectOptions(projectId));

  if (projectQuery.isPending) {
    return <WritingWorkspaceSkeleton />;
  }

  if (projectQuery.isError) {
    return (
      <div className="min-h-dvh bg-muted/20">
        <WritingAppHeader />
        <main className="mx-auto flex w-full max-w-2xl px-5 py-16 sm:px-6 sm:py-24">
          <div className="w-full rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
            <Alert variant="destructive" className="border-0 bg-destructive/5 p-5">
              <IconAlertTriangle />
              <AlertTitle>Could not open this project</AlertTitle>
              <AlertDescription className="flex flex-col gap-5">
                <p>
                  {getErrorMessage(projectQuery.error, "The writing project could not be loaded.")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={projectQuery.isFetching}
                    onClick={() => void projectQuery.refetch()}
                  >
                    {projectQuery.isFetching ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <IconRefresh data-icon="inline-start" />
                    )}
                    {projectQuery.isFetching ? "Trying again…" : "Try again"}
                  </Button>
                  <Button variant="ghost" size="sm" render={<Link to="/" />}>
                    <IconArrowLeft data-icon="inline-start" />
                    Back home
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return <WritingWorkspaceContent project={projectQuery.data} />;
}
