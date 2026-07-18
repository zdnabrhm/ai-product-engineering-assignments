import { createFileRoute } from "@tanstack/react-router";
import { CreateWritingProjectPage } from "@/modules/writing/components/create-writing-project-page";

export const Route = createFileRoute("/")({
  component: CreateWritingProjectPage,
});
