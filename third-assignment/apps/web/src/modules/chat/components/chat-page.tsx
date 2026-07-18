import { useChat } from "@anvia/react";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@third-assignment/ui/components/button";
import { env } from "@/env";
import { ChatComposer } from "./chat-composer";
import { MessageList } from "./message-list";

export function ChatPage() {
  const { send, messages, status } = useChat({
    endpoint: `${env.VITE_API_URL}/chat`,
  });

  return (
    <main className="flex h-dvh w-full flex-col">
      <header className="shrink-0 border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-5 sm:px-8">
          <Link to="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <IconArrowLeft data-icon="inline-start" />
            Back home
          </Link>
        </div>
      </header>
      <section className="min-h-0 flex-1">
        <MessageList messages={messages} />
      </section>

      <ChatComposer isStreaming={status === "streaming"} onSend={send} />
    </main>
  );
}
