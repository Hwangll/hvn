import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { clampProgress, sceneBlend } from "../utils/sceneBlend";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Tune the scene rhythm here. Native scroll remains the only scroll driver in Part II.
export const partTwoMotion = {
  entrance: 0.92,
  settle: 0.44,
  scrub: 0.4,
  rise: 12,
  depth: 18,
  /** Layer drift through a scene, as a share of the viewport height per unit of data-parallax. */
  parallax: 0.12,
  /** Sideways travel in px per unit of data-drift. */
  drift: 240,
  /** Upward travel of rising props, as a share of the viewport height. */
  riseTravel: 0.4,
  /** Downward travel of sinking props, as a share of the viewport height. */
  sinkTravel: 0.16,
  /** How many sine periods a bobbing prop completes across one scene. */
  waveCycles: 1.6,
  /** Distance (share of viewport) over which a piece of copy fades in, and the stagger between siblings. */
  reveal: 0.34,
  revealStagger: 0.06,
  /** Blur applied to a panel at the far end of a crossfade, and to copy before it settles. */
  panelBlur: 10,
  copyBlur: 6,
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface SceneEffect {
  parallax: number;
  drift: number;
  wave: number;
  rise: number;
  sink: number;
  spin: number;
  tilt: number;
  glow: number;
  delay: number;
  sheen: boolean;
  phase: number;
  baseRotation: number;
  baseOpacity: number;
  x: (value: number) => void;
  y: (value: number) => void;
  rotation: (value: number) => void;
  scale: (value: number) => void;
  opacity: (value: number) => void;
  sheenX?: (value: number) => void;
}

function readEffect(element: HTMLElement, index: number): SceneEffect {
  const num = (name: string) => Number(element.dataset[name] ?? 0) || 0;
  const setter = (property: string, unit?: string) => gsap.quickSetter(element, property, unit) as (value: number) => void;
  return {
    parallax: num("parallax"),
    drift: num("drift"),
    wave: num("wave"),
    rise: num("rise"),
    sink: num("sink"),
    spin: num("spin"),
    tilt: num("tilt"),
    glow: num("glow"),
    delay: Math.min(0.9, Math.max(0, num("delay"))),
    sheen: element.dataset.sheen !== undefined,
    // Neighbouring props start their bob at different points of the wave.
    phase: (index * 2.399) % (Math.PI * 2),
    baseRotation: Number(gsap.getProperty(element, "rotation")) || 0,
    baseOpacity: Number(gsap.getProperty(element, "opacity")) || 1,
    x: setter("x", "px"),
    y: setter("y", "px"),
    rotation: setter("rotation", "deg"),
    scale: setter("scale"),
    opacity: setter("opacity"),
    sheenX: element.dataset.sheen !== undefined ? setter("--sheen-x", "%") : undefined,
  };
}

const EFFECT_SELECTOR = "[data-parallax], [data-drift], [data-wave], [data-rise], [data-sink], [data-spin], [data-tilt], [data-glow], [data-delay], [data-sheen]";

export function usePartTwoScroll(scope: RefObject<HTMLDivElement | null>, mobile: boolean, reducedMotion: boolean) {
  useGSAP(() => {
    const root = scope.current;
    const part = root?.querySelector<HTMLElement>(".story-part-2");
    if (!root || !part) return;
    const steps = Array.from(part.querySelectorAll<HTMLElement>("[data-story-step]"));
    const panels = Array.from(part.querySelectorAll<HTMLElement>("[data-offline-panel]"));
    const moods = root.closest("main")?.querySelectorAll<HTMLElement>("[data-offline-mood]") ?? [];
    const depths = root.closest("main")?.querySelectorAll<HTMLElement>("[data-water-depth]") ?? [];
    const threads = steps.map((_, i) => (panels[i] ?? steps[i]).querySelectorAll<SVGPathElement>(".thread-path, .thread-shadow"));
    const statement = part.querySelector<HTMLElement>(".sunset-statement");
    const effectElements = panels.map((panel) => Array.from(panel.querySelectorAll<HTMLElement>(EFFECT_SELECTOR)));
    const revealElements = steps.map((step) => Array.from(step.querySelectorAll<HTMLElement>("[data-step-reveal]")));
    if (!steps.length) return;

    // quickSetter avoids allocating tweens or reading layout on every scroll frame.
    // Restore the original inline styles as these setters also touch elements outside scope.
    const animated = [
      ...moods, ...panels, ...depths, ...threads.flatMap((paths) => Array.from(paths)), ...(statement ? [statement] : []),
      ...effectElements.flat(), ...revealElements.flat(),
    ];
    const originalStyles = animated.map((element) => element.getAttribute("style"));
    const moodSetters = Array.from(moods, (mood) => gsap.quickSetter(mood, "opacity"));
    const panelSetters = panels.map((panel) => ({
      alpha: gsap.quickSetter(panel, "opacity"),
      visibility: gsap.quickSetter(panel, "visibility"),
      filter: gsap.quickSetter(panel, "filter"),
      y: gsap.quickSetter(panel, "y", "px"),
      scaleX: gsap.quickSetter(panel, "scaleX"),
      scaleY: gsap.quickSetter(panel, "scaleY"),
    }));
    const threadSetters = threads.map((paths) => gsap.quickSetter(paths, "strokeDashoffset"));
    const depthSetters = Array.from(depths, (depth) => gsap.quickSetter(depth, "y", "px"));
    const depthRates = Array.from(depths, (depth) => Number(depth.dataset.waterDepth));
    const statementSetter = statement ? gsap.quickSetter(statement, "opacity") : undefined;
    const effects = effectElements.map((elements) => elements.map(readEffect));
    const reveals = revealElements.map((elements) => elements.map((element) => ({
      // Word-mode copy keeps its own opacity and lets CSS cascade the words from `--reveal`.
      words: element.dataset.stepReveal === "words",
      reveal: gsap.quickSetter(element, "--reveal") as (value: number) => void,
      opacity: gsap.quickSetter(element, "opacity") as (value: number) => void,
      y: gsap.quickSetter(element, "y", "px") as (value: number) => void,
      filter: gsap.quickSetter(element, "filter") as (value: string) => void,
    })));
    let boundaries: number[] = [];
    let starts: number[] = [];
    let heights: number[] = [];
    let revealTops: number[][] = [];
    let travel = 1;
    let viewport = window.innerHeight;
    const driver = { progress: 0 };
    let mounted = true;
    const paint = () => {
      // The scrub tween can deliver one last frame after cleanup; never repaint over restored styles.
      if (!mounted) return;
      const position = driver.progress * travel;
      const blend = sceneBlend(position, boundaries, viewport * (partTwoMotion.entrance - partTwoMotion.settle));
      moodSetters.forEach((set, i) => set(blend[i] ?? 0));
      panelSetters.forEach((set, i) => {
        const entered = i === 0 ? 1 : (blend[i - 1] ?? 0);
        const leaving = blend[i] ?? 0;
        const opacity = entered * (1 - leaving);
        set.alpha(opacity);
        set.visibility(opacity > 0 ? "visible" : "hidden");
        set.y(reducedMotion ? 0 : (1 - entered) * partTwoMotion.rise - leaving * 8);
        set.scaleX(reducedMotion ? 1 : 0.98 + opacity * 0.02);
        set.scaleY(reducedMotion ? 1 : 0.98 + opacity * 0.02);
        // Crossfades pass through a soft focus instead of a plain dissolve.
        const blur = reducedMotion ? 0 : (1 - opacity) * partTwoMotion.panelBlur;
        set.filter(blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : "none");

        // Props inside the scene move with the reader's progress through that scene.
        const local = clampProgress((position - starts[i] + viewport * partTwoMotion.entrance) / (heights[i] + viewport * partTwoMotion.entrance));
        const centred = local - 0.5;
        const wavePhase = local * Math.PI * 2 * partTwoMotion.waveCycles;
        for (const fx of effects[i] ?? []) {
          if (reducedMotion) {
            fx.x(0); fx.y(0); fx.scale(1); fx.rotation(fx.baseRotation); fx.opacity(fx.baseOpacity); fx.sheenX?.(-60);
            continue;
          }
          let x = 0;
          let y = 0;
          let rotation = fx.baseRotation;
          let alpha = fx.baseOpacity;
          let scale = 1;
          if (fx.parallax) y -= centred * fx.parallax * viewport * partTwoMotion.parallax;
          if (fx.drift) x += centred * fx.drift * partTwoMotion.drift;
          if (fx.wave) {
            y += Math.sin(wavePhase + fx.phase) * fx.wave;
            // Drifting props lean into the crest and trough of their wave.
            if (fx.drift) rotation += Math.cos(wavePhase + fx.phase) * Math.sign(fx.drift) * 6;
          }
          if (fx.rise) {
            y -= local * fx.rise * viewport * partTwoMotion.riseTravel;
            alpha *= 1 - Math.pow(local, 3);
          }
          if (fx.sink) y += local * fx.sink * viewport * partTwoMotion.sinkTravel;
          if (fx.spin) rotation += local * fx.spin;
          if (fx.glow) alpha *= clampProgress(local * 2.4);
          if (fx.tilt) rotation += (1 - entered) * fx.tilt;
          if (fx.delay) {
            // Staggered arrival: pop in slightly after the scene itself has started entering.
            const arrival = easeOut(clampProgress((entered - fx.delay) / (1 - fx.delay)));
            alpha *= smooth(arrival);
            scale = 0.86 + arrival * 0.14;
            y += (1 - arrival) * 18;
          }
          fx.x(x);
          fx.y(y);
          fx.rotation(rotation);
          fx.scale(scale);
          if (fx.rise || fx.glow || fx.delay) fx.opacity(alpha);
          fx.sheenX?.(-70 + local * 190);
        }
      });
      threadSetters.forEach((set, i) => {
        const draw = reducedMotion ? 1 : clampProgress((position - starts[i] + viewport * 0.8) / (heights[i] + viewport * 0.1));
        set(1 - draw);
      });
      // Copy in the reading column rises into focus as it approaches the eye line.
      reveals.forEach((sets, i) => {
        sets.forEach((set, k) => {
          if (reducedMotion) {
            set.opacity(1); set.y(0); set.filter("none"); set.reveal(1);
            return;
          }
          const top = (revealTops[i]?.[k] ?? starts[i]) - position;
          const progress = clampProgress((viewport * 0.92 - top) / (viewport * partTwoMotion.reveal) - k * partTwoMotion.revealStagger);
          const eased = easeOut(progress);
          set.reveal(eased);
          if (set.words) {
            set.opacity(1); set.y((1 - eased) * 10); set.filter("none");
            return;
          }
          set.opacity(eased);
          set.y((1 - eased) * 26);
          const blur = (1 - eased) * partTwoMotion.copyBlur;
          set.filter(blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : "none");
        });
      });
      if (!mobile && !reducedMotion) {
        depthSetters.forEach((set, i) => set(-driver.progress * partTwoMotion.depth * depthRates[i]));
        statementSetter?.(clampProgress((position - starts[starts.length - 1] + viewport * 0.48) / (viewport * 0.4)));
      }
    };
    const measure = (trigger: ScrollTrigger) => {
      viewport = window.innerHeight;
      travel = Math.max(1, trigger.end - trigger.start);
      starts = steps.map((step) => step.getBoundingClientRect().top + window.scrollY - trigger.start);
      heights = steps.map((step) => step.offsetHeight);
      revealTops = revealElements.map((elements) => elements.map((element) => element.getBoundingClientRect().top + window.scrollY - trigger.start));
      boundaries = starts.slice(1).map((start) => start - viewport * partTwoMotion.entrance);
      paint();
    };
    gsap.to(driver, {
      progress: 1, ease: "none", onUpdate: paint,
      scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: reducedMotion ? true : partTwoMotion.scrub, onRefresh: measure },
    });

    let refreshFrame = 0;
    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(part);
    root.addEventListener("load", refresh, true);
    void document.fonts?.ready.then(() => { if (mounted) refresh(); });
    return () => {
      mounted = false;
      observer.disconnect();
      root.removeEventListener("load", refresh, true);
      cancelAnimationFrame(refreshFrame);
      animated.forEach((element, i) => {
        const style = originalStyles[i];
        if (style === null) element.removeAttribute("style");
        else element.setAttribute("style", style);
      });
    };
  }, { scope, dependencies: [mobile, reducedMotion], revertOnUpdate: true });
}
