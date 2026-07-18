import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { IconCheck, IconCopy, IconDownload, IconPlus } from "@tabler/icons-react";
import { Button } from "@third-assignment/ui/components/button";
import { Spinner } from "@third-assignment/ui/components/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@third-assignment/ui/components/card";
import type { WritingProject } from "../service";

type CopyState = "idle" | "copying" | "copied" | "error";

function CopyButtonState({ state }: { state: CopyState }) {
  if (state === "copying") {
    return (
      <>
        <Spinner data-icon="inline-start" /> Copying…
      </>
    );
  }

  if (state === "copied") {
    return (
      <>
        <IconCheck data-icon="inline-start" /> Copied to clipboard
      </>
    );
  }

  return (
    <>
      <IconCopy data-icon="inline-start" /> Copy article
    </>
  );
}

function downloadArticle(project: WritingProject): void {
  const fileName = `${
    project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "article"
  }.txt`;
  const url = URL.createObjectURL(
    new Blob([project.article], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function CompletedProjectActions({ project }: { project: WritingProject }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const wordCount = project.article.trim() ? project.article.trim().split(/\s+/).length : 0;

  async function copyArticle(): Promise<void> {
    setCopyState("copying");

    try {
      await navigator.clipboard.writeText(project.article);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <Card className="gap-0 overflow-hidden">
      <CardHeader className="bg-foreground px-5 py-6 text-background sm:px-6">
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-background/10 ring-1 ring-background/15">
          <IconCheck className="size-5" />
        </div>
        <CardTitle className="text-lg text-background">Article completed</CardTitle>
        <CardDescription className="max-w-sm leading-6 text-background/65">
          Your selected beats are assembled into a final {wordCount.toLocaleString("en")}-word
          article.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 bg-card px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-1">
        <Button
          variant="outline"
          disabled={copyState === "copying"}
          onClick={() => void copyArticle()}
        >
          <CopyButtonState state={copyState} />
        </Button>
        <Button variant="outline" onClick={() => downloadArticle(project)}>
          <IconDownload data-icon="inline-start" />
          Download .txt
        </Button>
        {copyState === "error" && (
          <p
            role="alert"
            className="text-xs leading-5 text-destructive sm:col-span-2 lg:col-span-1"
          >
            Clipboard access was blocked. Download the article instead.
          </p>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/15 px-5 pt-5 sm:px-6">
        <Button className="w-full" render={<Link to="/" />}>
          <IconPlus data-icon="inline-start" />
          Start a new writing project
        </Button>
      </CardFooter>
    </Card>
  );
}
