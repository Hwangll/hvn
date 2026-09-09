import type { ReactNode } from "react";

interface SceneScreenProps {
  title: string;
  tone?: "paper" | "blue" | "warm";
  className?: string;
  children: ReactNode;
}

/** A small phone-screen card: Part I happened almost entirely behind a screen. */
export function SceneScreen({ title, tone = "paper", className = "", children }: SceneScreenProps) {
  return (
    <div className={`scene-screen tone-${tone} ${className}`.trim()}>
      <header className="scene-screen-bar">
        <i aria-hidden="true" />
        <i aria-hidden="true" />
        <i aria-hidden="true" />
        <span>{title}</span>
      </header>
      <div className="scene-screen-body">{children}</div>
    </div>
  );
}
