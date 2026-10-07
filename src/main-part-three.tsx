// Part III (`/part-3/`). It goes on with Part II's diary, so it ships Part II's stylesheets (the `?page=three` copies
// drop the rules scoped to Part I, see pageScopedCss in vite.config.ts) and then its own palette and scenes on top.
import { mountStory } from "./app/mountStory";
import "./styles/index.css?page=three";
import "./styles/diary-design.css?page=three";
import "./styles/memory-opening.css?page=three";
import "./styles/story-motion.css?page=three";
import "./styles/part-one-scenes.css?page=three";
import "./styles/part-one-layout.css?page=three";
import "./styles/part-one-edition.css?page=three";
import "./styles/motion-edition.css?page=three";
import "./styles/depth-field.css?page=three";
import "./styles/part-one-depth.css?page=three";
import "./styles/part-two-depth.css?page=three";
import "./styles/scroll-life.css?page=three";
import "./styles/story-part-three.css?page=three";
import "./styles/story-part-three-autumn.css?page=three";

mountStory();
