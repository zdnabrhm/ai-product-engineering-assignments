import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@anvia/react";
import { env } from "@/env";
import { Button } from "@third-assignment/ui/components/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { send, messages } = useChat({
    endpoint: `${env.VITE_API_URL}/chat`,
  });

  console.log(messages);

  return (
    <main>
      <div>
        {messages.map((message) => {
          return message.parts.map((part) => {
            return part.type === "text" ? <p key={part.id}>{part.text}</p> : "";
          });
        })}
      </div>

      <Button onClick={() => send("Who are you?")}>Send “Who are you?”</Button>
    </main>
  );
}
