// Part I (`/`). Part II has its own entry (main-part-two.tsx) so each page ships only the CSS it can use.
import { mountStory } from "./app/mountStory";
import "./styles/index.css";
import "./styles/diary-design.css";
import "./styles/memory-opening.css";
import "./styles/story-motion.css";
import "./styles/part-one-scenes.css";
import "./styles/part-one-layout.css";
import "./styles/part-one-edition.css";

mountStory();
