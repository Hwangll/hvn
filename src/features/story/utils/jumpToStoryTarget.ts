import { scrollStoryTo } from "../../../shared/hooks/useLenisScroll";

export function jumpToStoryTarget(targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) {
    return false;
  }

  document.documentElement.classList.add("is-instant-story-jump");
  scrollStoryTo(target);
  window.requestAnimationFrame(() => {
    document.documentElement.classList.remove("is-instant-story-jump");
  });
  return true;
}
