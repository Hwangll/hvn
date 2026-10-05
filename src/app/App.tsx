import { MotionProvider } from "../shared/motion/MotionProvider";
import { AppShell } from "./AppShell";
import { resolveStoryPage } from "./storyPage";

export default function App() {
  return (
    <MotionProvider>
      <AppShell page={resolveStoryPage(window.location.pathname)} />
    </MotionProvider>
  );
}
