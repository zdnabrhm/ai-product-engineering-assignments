import { useState } from "react";
import { IconBook2, IconChevronDown, IconNotes, IconTargetArrow } from "@tabler/icons-react";
import { Badge } from "@third-assignment/ui/components/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@third-assignment/ui/components/collapsible";
import { cn } from "@third-assignment/ui/lib/utils";
import type { WritingProject } from "../service";

export function SourceContext({
  project,
  compact = false,
}: {
  project: WritingProject;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-xs",
        compact ? "w-full" : "mx-auto mt-5 w-full max-w-[52rem]",
      )}
    >
      <CollapsibleTrigger className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors outline-none hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-6">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <IconBook2 className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Source context</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            Material, prerequisites, and {project.groundedConcepts.length} grounded concepts
          </span>
        </span>
        <IconChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform group-hover:text-foreground",
            isOpen && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "border-t bg-muted/15 px-5 py-5 sm:px-6 sm:py-6",
          compact && "max-h-[28rem] overflow-y-auto",
        )}
      >
        <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
          <section className="rounded-xl border bg-background p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <IconNotes className="size-4" />
              Source material
            </div>
            <p className="mt-3 text-sm leading-6 whitespace-pre-wrap">{project.rawMaterial}</p>
          </section>
          <section className="rounded-xl border bg-background p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <IconTargetArrow className="size-4" />
              Prerequisites
            </div>
            <p className="mt-3 text-sm leading-6 whitespace-pre-wrap">{project.prerequisites}</p>
          </section>
        </div>
        {project.groundedConcepts.length > 0 && (
          <section className="mt-5">
            <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Grounded concepts
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.groundedConcepts.map((concept) => (
                <Badge
                  key={concept}
                  variant="secondary"
                  className="h-auto min-h-6 px-2.5 py-1 whitespace-normal"
                >
                  {concept}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
