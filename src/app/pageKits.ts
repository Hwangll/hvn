import type { MemoryIntro } from "../features/intro/components/MemoryIntro";
import type { PartThreeAtmosphere } from "../features/story/components/PartThreeAtmosphere";
import type { PartThreeDepth } from "../features/story/components/PartThreeDepth";
import type { StoryPartThreeEnding } from "../features/story/components/StoryPartThreeEnding";
import type { AutumnMapPocket } from "../features/story/components/film/AutumnMap";
import type { CanvasSlate, StageSlate } from "../features/story/components/film/ChapterSlate";
import type { FilmLeader } from "../features/story/components/film/FilmLeader";
import type { PostCreditsScene } from "../features/story/components/film/PostCreditsScene";
import type { RouteCar, RouteSpeedometer } from "../features/story/components/film/RouteDashboard";
import type { SceneMoment } from "../features/story/components/film/SceneMoment";
import type { PartThreeScene } from "../features/story/components/scenes/PartThreeScene";

/**
 * What only one page uses, kept out of the code the three pages share. Each page's entry fills in its own kit before
 * the app mounts (src/app/kits), so Part I's page, the one every reader opens first, never downloads Part III's scenes
 * and film, and the later pages never download the memory room. Shared components take these parts from here where
 * they would have imported them, at render time, and leave them out on a page without them.
 */
export const memoryRoomKit: { MemoryIntro?: typeof MemoryIntro } = {};

export const partThreeKit: {
  Scene?: typeof PartThreeScene;
  Atmosphere?: typeof PartThreeAtmosphere;
  Depth?: typeof PartThreeDepth;
  Ending?: typeof StoryPartThreeEnding;
  FilmLeader?: typeof FilmLeader;
  PostCreditsScene?: typeof PostCreditsScene;
  AutumnMapPocket?: typeof AutumnMapPocket;
  StageSlate?: typeof StageSlate;
  CanvasSlate?: typeof CanvasSlate;
  SceneMoment?: typeof SceneMoment;
  RouteCar?: typeof RouteCar;
  RouteSpeedometer?: typeof RouteSpeedometer;
} = {};
