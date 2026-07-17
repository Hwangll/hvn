import type { ReactNode } from "react";

interface ChatBubbleProps {
  children: ReactNode;
  tone: "coral" | "ink" | "muted" | "paper";
  icon?: ReactNode;
}

export function ChatBubble({ children, tone, icon }: ChatBubbleProps) {
  return (
    <span className={`chat-bubble tone-${tone}`}>
      {icon}
      {children}
    </span>
  );
}
