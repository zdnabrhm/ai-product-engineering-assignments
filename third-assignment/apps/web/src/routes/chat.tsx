import { createFileRoute } from "@tanstack/react-router";
import { ChatPage } from "@/modules/chat/components/chat-page";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});
