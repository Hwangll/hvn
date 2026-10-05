// Part II (`/part-2/`). The same app and the same stylesheets in the same order as Part I; the `?page=two` copies
// let the production build drop the rules scoped to Part I from this page's CSS (see pageScopedCss in vite.config.ts).
import { mountStory } from "./app/mountStory";
import "./styles/index.css?page=two";
import "./styles/diary-design.css?page=two";
import "./styles/memory-opening.css?page=two";
import "./styles/story-motion.css?page=two";
import "./styles/part-one-scenes.css?page=two";
import "./styles/part-one-layout.css?page=two";
import "./styles/part-one-edition.css?page=two";
import "./styles/motion-edition.css?page=two";
import "./styles/part-one-depth.css?page=two";

mountStory();
