import { Link } from "@tanstack/react-router";
import { IconArrowLeft, IconPencil } from "@tabler/icons-react";
import { Button } from "@third-assignment/ui/components/button";
import { cn } from "@third-assignment/ui/lib/utils";

export function WritingAppHeader({
  title,
  trailing,
  layout = "default",
}: {
  title?: string;
  trailing?: React.ReactNode;
  layout?: "default" | "setup";
}) {
  const isSetupLayout = layout === "setup";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 shrink-0 items-center border-b bg-background/90 px-4 backdrop-blur-xl sm:px-6",
        isSetupLayout && "lg:px-0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1440px] items-center gap-3",
          isSetupLayout &&
            "lg:grid lg:max-w-none lg:grid-cols-[minmax(18rem,0.72fr)_minmax(32rem,1.28fr)] lg:gap-0",
        )}
      >
        <Link
          to="/"
          aria-label={isSetupLayout ? "Beat Writer home" : "Back to projects"}
          className={cn(
            "group flex shrink-0 items-center gap-2.5 rounded-lg text-sm font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            isSetupLayout && "lg:px-12",
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-lg border bg-card shadow-xs transition-colors group-hover:bg-muted">
            {isSetupLayout ? (
              <IconPencil className="size-4" />
            ) : (
              <IconArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            )}
          </span>
          <span>Beat Writer</span>
        </Link>
        <div className={cn("flex min-w-0 flex-1 items-center gap-3", isSetupLayout && "lg:px-16")}>
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3",
              isSetupLayout && "lg:mx-auto lg:w-full lg:max-w-2xl",
            )}
          >
            {title ? (
              <>
                <span className="hidden h-5 w-px shrink-0 bg-border sm:block" />
                <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground" title={title}>
                  {title}
                </p>
              </>
            ) : (
              <div className="flex-1" />
            )}
            {trailing ?? (
              <Button variant="ghost" size="sm" render={<Link to="/chat" />}>
                Open chat
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
