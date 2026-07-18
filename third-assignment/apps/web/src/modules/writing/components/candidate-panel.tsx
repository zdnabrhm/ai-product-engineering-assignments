import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertTriangle,
  IconCheck,
  IconFlag,
  IconInfoCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@third-assignment/ui/components/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@third-assignment/ui/components/alert-dialog";
import { Button } from "@third-assignment/ui/components/button";
import { Skeleton } from "@third-assignment/ui/components/skeleton";
import { Spinner } from "@third-assignment/ui/components/spinner";
import {
  completeWritingProjectMutationOptions,
  retryWritingProjectMutationOptions,
} from "../query";
import type { WritingProject } from "../service";
import { getErrorMessage } from "../error-message";
import { BeatCandidateCard } from "./beat-candidate-card";
import { CompletedProjectActions } from "./completed-project-actions";

function CandidateSkeletons() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CandidatePanel({
  project,
  selectedCandidateId,
  applyingCandidateId,
  isChoosing,
  onSelectCandidate,
}: {
  project: WritingProject;
  selectedCandidateId?: string;
  applyingCandidateId?: string;
  isChoosing: boolean;
  onSelectCandidate: (candidateId: string) => void;
}) {
  const queryClient = useQueryClient();
  const completeProject = useMutation(completeWritingProjectMutationOptions(queryClient));
  const retryProject = useMutation(retryWritingProjectMutationOptions(queryClient));

  if (project.status === "COMPLETED") {
    return <CompletedProjectActions project={project} />;
  }

  if (project.status === "FAILED") {
    return (
      <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:p-5">
        <Alert variant="destructive" className="border-0 bg-transparent p-0">
          <IconAlertTriangle />
          <AlertTitle>Generation paused</AlertTitle>
          <AlertDescription className="flex flex-col gap-5">
            <p>{project.error ?? "We could not prepare the next possible directions."}</p>
            {retryProject.error && (
              <p>{getErrorMessage(retryProject.error, "Could not retry the writing workflow.")}</p>
            )}
            <Button
              size="sm"
              disabled={retryProject.isPending}
              onClick={() => retryProject.mutate(project.id)}
            >
              {retryProject.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <IconRefresh data-icon="inline-start" />
              )}
              {retryProject.isPending ? "Trying again…" : "Generate directions again"}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (project.status === "QUEUED" || project.status === "GENERATING_BEATS") {
    return (
      <div className="flex flex-col gap-5">
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-xs sm:p-5">
          <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-muted">
            <div className="h-full w-1/2 animate-pulse bg-foreground" />
          </div>
          <div className="flex items-start gap-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
              <Spinner className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">
                {project.status === "QUEUED"
                  ? "Preparing the writing room"
                  : "Exploring distinct directions"}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                The current draft stays available while the next editorial directions are prepared.
              </p>
            </div>
          </div>
        </div>
        <CandidateSkeletons />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {project.generationNote && (
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <IconInfoCircle className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Editorial rationale
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {project.generationNote}
              </p>
            </div>
          </div>
        </div>
      )}

      {project.candidates.length > 0 ? (
        <div className="flex flex-col gap-3">
          {project.candidates.map((candidate, index) => (
            <BeatCandidateCard
              key={candidate.id}
              candidate={candidate}
              index={index}
              isSelected={selectedCandidateId === candidate.id}
              isApplying={applyingCandidateId === candidate.id}
              isDisabled={isChoosing || completeProject.isPending}
              onSelect={() => onSelectCandidate(candidate.id)}
            />
          ))}
        </div>
      ) : (
        <Alert>
          <IconInfoCircle />
          <AlertTitle>No directions are available yet</AlertTitle>
          <AlertDescription>
            Refresh the project in a moment. The writing workflow may still be publishing its
            suggestions.
          </AlertDescription>
        </Alert>
      )}

      {project.canFinish && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="flex items-start gap-3 p-4 sm:p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <IconFlag className="size-4.5" />
            </span>
            <div>
              <p className="text-sm font-medium">The article can stand on its own</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Finish now, or choose another direction to add one more beat.
              </p>
            </div>
          </div>
          <div className="border-t bg-muted/15 p-4 sm:px-5">
            {completeProject.error && (
              <p role="alert" className="mb-3 text-sm text-destructive">
                {getErrorMessage(completeProject.error, "Could not complete this article.")}
              </p>
            )}
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isChoosing || completeProject.isPending}
                  />
                }
              >
                <IconCheck data-icon="inline-start" />
                Finish article
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Finish this article?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will not be able to add another beat after completing it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={completeProject.isPending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={completeProject.isPending}
                    onClick={() => completeProject.mutate(project.id)}
                  >
                    {completeProject.isPending && <Spinner data-icon="inline-start" />}
                    {completeProject.isPending ? "Finishing…" : "Finish article"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}
