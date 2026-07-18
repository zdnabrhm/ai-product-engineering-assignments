import { IconClock, IconFileText, IconHistory } from "@tabler/icons-react";
import { Badge } from "@third-assignment/ui/components/badge";
import { Separator } from "@third-assignment/ui/components/separator";
import type { WritingProject } from "../service";

function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function ArticleView({ project }: { project: WritingProject }) {
  const article = project.article.trim();
  const wordCount = article ? article.split(/\s+/).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));
  const paragraphs = article ? article.split(/\n{2,}/) : [];
  const isCompleted = project.status === "COMPLETED";

  return (
    <article className="mx-auto w-full max-w-[52rem] overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/25 px-6 py-4 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            <IconFileText className="size-4" />
            {isCompleted ? "Final article" : "Working draft"}
          </div>
          <Badge variant="outline" className="font-normal text-muted-foreground">
            Revision {String(project.revision + 1).padStart(2, "0")}
          </Badge>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-11 lg:px-12">
        <h1 className="max-w-[44rem] text-3xl leading-tight font-semibold tracking-[-0.035em] text-balance sm:text-4xl sm:leading-[1.12]">
          {project.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <IconHistory className="size-3.5" />
            {formatUpdatedAt(project.updatedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <IconFileText className="size-3.5" />
            {wordCount.toLocaleString("en")} words
          </span>
          <span className="flex items-center gap-1.5">
            <IconClock className="size-3.5" />
            {readingMinutes} min read
          </span>
        </div>

        <Separator className="my-8 sm:my-10" />

        {paragraphs.length > 0 ? (
          <div className="flex flex-col gap-6 text-[17px] leading-8 text-foreground/90 sm:text-[18px] sm:leading-9">
            {paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl border border-dashed bg-muted/25 px-6 py-10 sm:px-8">
            <div className="absolute -top-12 -right-12 size-32 rounded-full bg-foreground/5 blur-2xl" />
            <div className="relative max-w-lg">
              <div className="flex size-10 items-center justify-center rounded-xl border bg-background shadow-xs">
                <IconFileText className="size-5" />
              </div>
              <p className="mt-5 font-medium">Your article will take shape here.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The first draft appears after you choose a direction. Each selection adds a grounded
                beat to the article.
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
