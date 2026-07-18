import { IconCheck } from "@tabler/icons-react";
import { Spinner } from "@third-assignment/ui/components/spinner";
import { cn } from "@third-assignment/ui/lib/utils";
import type { WritingProject } from "../service";

type BeatCandidate = WritingProject["candidates"][number];

function CandidateState({
  isApplying,
  isSelected,
  sourceCount,
}: {
  isApplying: boolean;
  isSelected: boolean;
  sourceCount: number;
}) {
  if (isApplying) {
    return (
      <>
        <Spinner className="size-3" /> Applying
      </>
    );
  }

  if (isSelected) {
    return (
      <>
        <IconCheck className="size-3.5" /> Selected
      </>
    );
  }

  return <>{sourceCount} sources</>;
}

export function BeatCandidateCard({
  candidate,
  index,
  isSelected,
  isApplying,
  isDisabled,
  onSelect,
}: {
  candidate: BeatCandidate;
  index: number;
  isSelected: boolean;
  isApplying: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      disabled={isDisabled}
      className={cn(
        "w-full rounded-xl border bg-card p-4 text-left transition-[border-color,box-shadow,opacity,transform] hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        isSelected && "border-foreground/35 shadow-md ring-1 ring-foreground/10",
        isDisabled && !isApplying && "opacity-55 hover:translate-y-0 hover:shadow-none",
      )}
      onClick={onSelect}
    >
      <span className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-mono">Direction {String(index + 1).padStart(2, "0")}</span>
        <span className="flex items-center gap-1.5">
          <CandidateState
            isApplying={isApplying}
            isSelected={isSelected}
            sourceCount={candidate.grounds.length}
          />
        </span>
      </span>
      <span className="mt-2 block text-sm leading-6 font-medium">{candidate.preview}</span>
    </button>
  );
}
