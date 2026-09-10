import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";
import "./styles/diary-design.css";
import "./styles/memory-opening.css";
import "./styles/story-motion.css";
import "./styles/part-one-scenes.css";
import "./styles/part-one-layout.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
