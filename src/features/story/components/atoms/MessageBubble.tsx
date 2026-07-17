import type { ReactNode } from "react";

interface MessageBubbleProps {
  children: ReactNode;
  tone?: "paper" | "muted" | "coral" | "typing";
  className?: string;
}

export function MessageBubble({ children, tone = "paper", className = "" }: MessageBubbleProps) {
  return <span className={`message-bubble tone-${tone} ${className}`.trim()}>{children}</span>;
}
