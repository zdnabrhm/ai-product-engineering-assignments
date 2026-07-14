import { useChat } from "@anvia/react";
import { env } from "@/env";
import { ChatComposer } from "./chat-composer";
import { MessageList } from "./message-list";

export function ChatPage() {
  const { send, messages, status } = useChat({
    endpoint: `${env.VITE_API_URL}/chat`,
  });

  return (
    <main className="flex h-dvh w-full flex-col">
      <section className="min-h-0 flex-1">
        <MessageList messages={messages} />
      </section>

      <ChatComposer isStreaming={status === "streaming"} onSend={send} />
    </main>
  );
}
