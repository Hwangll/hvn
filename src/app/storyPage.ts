export type StoryPage = "part-one" | "part-two";

export function resolveStoryPage(pathname: string): StoryPage {
  return /^\/part-2(?:\/|$)/.test(pathname) ? "part-two" : "part-one";
}
