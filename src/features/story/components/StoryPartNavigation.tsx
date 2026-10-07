import type { MouseEvent } from "react";
import { partHrefs, romanNumeral, type StoryPart, type StoryPartId } from "../data/story";
import { jumpToStoryTarget } from "../utils/jumpToStoryTarget";
import { useTuckOnScrollDown } from "../../../shared/hooks/useTuckOnScrollDown";

interface StoryPartNavigationProps {
  activePartId: StoryPartId;
  currentPagePartId: StoryPartId;
  onNavigate: (partId: StoryPartId) => void;
  parts: readonly StoryPart[];
}

export function StoryPartNavigation({ activePartId, currentPagePartId, onNavigate, parts }: StoryPartNavigationProps) {
  const tucked = useTuckOnScrollDown();
  const navigate = (event: MouseEvent<HTMLAnchorElement>, partId: StoryPartId) => {
    if (partId !== currentPagePartId) {
      return;
    }

    event.preventDefault();
    onNavigate(partId);
    jumpToStoryTarget(`part-${partId}`);
  };

  return (
    <nav className={`story-part-navigation ${tucked ? "is-tucked" : ""}`} aria-label="Điều hướng các phần câu chuyện">
      {parts.map((part) => (
        <a
          href={getPartHref(part.id, currentPagePartId)}
          className={activePartId === part.id ? "is-active" : ""}
          aria-current={activePartId === part.id ? "location" : undefined}
          key={part.id}
          onClick={(event) => navigate(event, part.id)}
        >
          <span>Phần {romanNumeral(part.number)}</span>
          <small>{part.title}</small>
        </a>
      ))}
    </nav>
  );
}

function getPartHref(partId: StoryPartId, currentPagePartId: StoryPartId) {
  if (partId === currentPagePartId) {
    return `#part-${partId}`;
  }

  return partHrefs[partId];
}
