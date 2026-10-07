import type { ReactNode } from "react";

interface SceneScreenProps {
  title: string;
  /** A second, quieter line under the title, the way a chat shows a contact's status. */
  subtitle?: string;
  /** The contact's picture beside the title. */
  avatar?: ReactNode;
  tone?: "paper" | "blue" | "warm";
  className?: string;
  children: ReactNode;
}

/** A phone lying on the diary page: Part I happened almost entirely behind a screen. */
export function SceneScreen({ title, subtitle, avatar, tone = "paper", className = "", children }: SceneScreenProps) {
  return (
    <div className={`scene-screen tone-${tone} ${className}`.trim()}>
      <div className="scene-screen-display">
        <i className="scene-screen-status" aria-hidden="true" />
        <header className="scene-screen-bar">
          <i className="scene-screen-back" aria-hidden="true" />
          {avatar}
          <span className="scene-screen-heading">
            <strong>{title}</strong>
            {subtitle ? <small>{subtitle}</small> : null}
          </span>
        </header>
        <div className="scene-screen-body">{children}</div>
      </div>
    </div>
  );
}
