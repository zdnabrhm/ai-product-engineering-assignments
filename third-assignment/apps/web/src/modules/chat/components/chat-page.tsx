import { useChat } from "@anvia/react";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@third-assignment/ui/components/button";
import { env } from "@/env";
import { ChatComposer } from "./chat-composer";
import { MessageList } from "./message-list";

export function ChatPage() {
  const { send, messages, status } = useChat({
    endpoint: `${env.VITE_API_URL}/chat`,
  });

  return (
    <main className="flex h-dvh w-full flex-col">
      <header className="flex h-14 shrink-0 items-center border-b px-4 sm:px-6">
        <Button variant="ghost" size="sm" render={<Link to="/" />}>
          <IconArrowLeft data-icon="inline-start" />
          Back home
        </Button>
      </header>
      <section className="min-h-0 flex-1">
        <MessageList messages={messages} />
      </section>

      <ChatComposer isStreaming={status === "streaming"} onSend={send} />
    </main>
  );
}
