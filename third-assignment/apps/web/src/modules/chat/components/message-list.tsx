import type { UIMessage } from "@anvia/react";
import { Bubble, BubbleContent } from "@third-assignment/ui/components/bubble";
import { Message, MessageContent } from "@third-assignment/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@third-assignment/ui/components/message-scroller";

export function MessageList({ messages }: { messages: UIMessage[] }) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller>
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-3xl p-4">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={isUser}>
                  <Message align={isUser ? "end" : "start"}>
                    <MessageContent>
                      {message.parts.map((part) => {
                        if (part.type !== "text") return null;

                        return (
                          <Bubble
                            key={part.id}
                            align={isUser ? "end" : "start"}
                            variant={isUser ? "default" : "ghost"}
                          >
                            <BubbleContent>
                              <span className="whitespace-pre-wrap">{part.text}</span>
                            </BubbleContent>
                          </Bubble>
                        );
                      })}
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              );
            })}
          </MessageScrollerContent>
        </MessageScrollerViewport>

        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
