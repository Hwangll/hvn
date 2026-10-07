export type StoryPage = "part-one" | "part-two" | "part-three";

export function resolveStoryPage(pathname: string): StoryPage {
  if (/^\/part-3(?:\/|$)/.test(pathname)) return "part-three";
  return /^\/part-2(?:\/|$)/.test(pathname) ? "part-two" : "part-one";
}

/**
 * Part III goes on with Part II's diary of days spent together, so its page also carries Part II's page classes and
 * inherits that diary's layout (story-part-two.css); its own classes give it its palette and scenes
 * (story-part-three.css).
 */
export const pageScopes: Record<StoryPage, { app: string; main: string }> = {
  "part-one": { app: "app-part-one", main: "story-page-part-one" },
  "part-two": { app: "app-part-two", main: "story-page-part-two" },
  "part-three": { app: "app-part-two app-part-three", main: "story-page-part-two story-page-part-three" },
};
