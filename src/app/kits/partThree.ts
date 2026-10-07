// Part III's page: its scenes and scenery, and the film it plays as (see pageKits).
import { PartThreeAtmosphere } from "../../features/story/components/PartThreeAtmosphere";
import { PartThreeDepth } from "../../features/story/components/PartThreeDepth";
import { StoryPartThreeEnding } from "../../features/story/components/StoryPartThreeEnding";
import { AutumnMapPocket } from "../../features/story/components/film/AutumnMap";
import { CanvasSlate, StageSlate } from "../../features/story/components/film/ChapterSlate";
import { FilmLeader } from "../../features/story/components/film/FilmLeader";
import { PostCreditsScene } from "../../features/story/components/film/PostCreditsScene";
import { RouteCar, RouteSpeedometer } from "../../features/story/components/film/RouteDashboard";
import { SceneMoment } from "../../features/story/components/film/SceneMoment";
import { PartThreeScene } from "../../features/story/components/scenes/PartThreeScene";
import { partThreeKit } from "../pageKits";

Object.assign(partThreeKit, {
  Scene: PartThreeScene,
  Atmosphere: PartThreeAtmosphere,
  Depth: PartThreeDepth,
  Ending: StoryPartThreeEnding,
  FilmLeader,
  PostCreditsScene,
  AutumnMapPocket,
  StageSlate,
  CanvasSlate,
  SceneMoment,
  RouteCar,
  RouteSpeedometer,
});
