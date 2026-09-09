import { AppShell } from "./AppShell";
import { resolveStoryPage } from "./storyPage";

export default function App() {
  return <AppShell page={resolveStoryPage(window.location.pathname)} />;
}
