import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/** Both pages boot the same app; each page entry only differs in the stylesheet it ships. */
export function mountStory() {
  createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
