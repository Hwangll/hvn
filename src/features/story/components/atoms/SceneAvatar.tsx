import { useState } from "react";
import { StoryPicture } from "../../../../shared/components/visuals/StoryPicture";

interface SceneAvatarProps {
  src?: string;
  alt: string;
  initials: string;
  className?: string;
}

export function SceneAvatar({ src, alt, initials, className = "" }: SceneAvatarProps) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`scene-avatar ${className}`.trim()}>
      {src && !failed ? <StoryPicture src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} /> : <span>{initials}</span>}
    </span>
  );
}
