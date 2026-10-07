import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { clampProgress, sceneBlend } from "../utils/sceneBlend";
import { readingRevealProgress, sceneDissolve } from "../utils/partTwoMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Tune the scene rhythm here. Lenis smooths the wheel and feeds ScrollTrigger, so the scrub itself stays direct:
// smoothing the same motion twice reads as lag rather than as weight.
export const partTwoMotion = {
  entrance: 0.92,
  settle: 0.44,
  scrub: 0.3,
  rise: 9,
  /** Scroll travel of the deepest fixed-sky layer across the whole part, in px (layers scale it by data-water-depth). */
  depth: 110,
  /** Layer drift through a scene, as a share of the viewport height per unit of data-parallax. */
  parallax: 0.085,
  /** Sideways travel in px per unit of data-drift. */
  drift: 170,
  /** Upward travel of rising props, as a share of the viewport height. */
  riseTravel: 0.3,
  /** Downward travel of sinking props, as a share of the viewport height. */
  sinkTravel: 0.12,
  /** How many sine periods a bobbing prop completes across one scene. */
  waveCycles: 1.1,
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type NumberSetter = (value: number) => void;

/**
 * Most scroll frames leave most props where they were: the scenes off stage are clamped, and settled copy stays put.
 * Rounding to an invisible step and skipping repeats keeps those frames from re-rendering transform strings and
 * dirtying styles for nothing. GSAP renders the whole transform on every x/y/rotation/scale call, so each skipped
 * component is one less transform string per prop per frame.
 */
function memoNumber(set: NumberSetter, step: number): NumberSetter {
  const inverse = 1 / step;
  let last = Number.NaN;
  return (value) => {
    const rounded = Math.round(value * inverse) / inverse;
    if (rounded === last) return;
    last = rounded;
    set(rounded);
  };
}

function memoString(set: (value: string) => void): (value: string) => void {
  let last: string | undefined;
  return (value) => {
    if (value === last) return;
    last = value;
    set(value);
  };
}

const quickNumber = (target: Element | Element[] | NodeListOf<Element>, property: string, step: number, unit?: string) =>
  memoNumber(gsap.quickSetter(target, property, unit) as NumberSetter, step);

interface SceneEffect {
  parallax: number;
  drift: number;
  wave: number;
  rise: number;
  float: number;
  sink: number;
  spin: number;
  sway: number;
  zoom: number;
  tilt: number;
  glow: number;
  delay: number;
  /** Signed local progress at which the prop appears (positive) or disappears (negative). */
  fade: number;
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
  /** Instant-film development (0 milky → 1 sharp), driven by the prop's staggered arrival. */
  develop?: (value: number) => void;
}

function readEffect(element: HTMLElement, index: number): SceneEffect {
  const num = (name: string) => Number(element.dataset[name] ?? 0) || 0;
  // Sub-pixel and sub-hundredth steps are invisible; they only cost style work.
  const setter = (property: string, unit?: string, step = 0.01) => quickNumber(element, property, step, unit);
  return {
    parallax: num("parallax"),
    drift: num("drift"),
    wave: num("wave"),
    rise: num("rise"),
    float: num("float"),
    sink: num("sink"),
    spin: num("spin"),
    sway: num("sway"),
    zoom: num("zoom"),
    tilt: num("tilt"),
    glow: num("glow"),
    delay: Math.min(0.9, Math.max(0, num("delay"))),
    fade: num("fade"),
    sheen: element.dataset.sheen !== undefined,
    // Neighbouring props start their bob at different points of the wave.
    phase: (index * 2.399) % (Math.PI * 2),
    baseRotation: Number(gsap.getProperty(element, "rotation")) || 0,
    baseOpacity: Number(gsap.getProperty(element, "opacity")),
    x: setter("x", "px"),
    y: setter("y", "px"),
    rotation: setter("rotation", "deg"),
    scale: setter("scale", undefined, 0.0001),
    opacity: setter("opacity", undefined, 0.001),
    sheenX: element.dataset.sheen !== undefined ? setter("--sheen-x", "%", 0.1) : undefined,
    develop: element.dataset.develop !== undefined ? setter("--develop", undefined, 0.001) : undefined,
  };
}

const EFFECT_SELECTOR = "[data-parallax], [data-drift], [data-wave], [data-rise], [data-float], [data-sink], [data-spin], [data-sway], [data-zoom], [data-tilt], [data-glow], [data-delay], [data-fade], [data-sheen], [data-develop]";
/** Sequential canvases are a third of the desktop stage, so sideways and vertical travel is scaled down to match. */
const SEQUENTIAL_AMPLITUDE = { drift: 0.5, parallax: 0.6, rise: 0.5, sink: 0.7 };

export function usePartTwoScroll(scope: RefObject<HTMLDivElement | null>, mobile: boolean, reducedMotion: boolean) {
  useGSAP(() => {
    const root = scope.current;
    // Part I shares the copy reveals (title words, ink words, quote stroke); its stage has no stacked panels, so the
    // scene-blend branch below is simply idle there.
    const part = root?.querySelector<HTMLElement>(".story-part-2, .story-part-1");
    if (!root || !part) return;
    const steps = Array.from(part.querySelectorAll<HTMLElement>("[data-story-step]"));
    const panels = Array.from(part.querySelectorAll<HTMLElement>("[data-offline-panel]"));
    // The desktop stage stack carries scene-wide film effects: a light leak on each handoff, motion blur from scroll speed.
    const stack = panels[0]?.parentElement ?? null;
    // The desktop stage stacks every diorama in one sticky frame; sequential layouts (phones, reduced motion)
    // host each diorama in its own canvas. Both drive the same props from the same scroll progress.
    const hosts = panels.length ? panels : steps.map((step) => step.querySelector<HTMLElement>(".mobile-scene-canvas")).filter((host): host is HTMLElement => Boolean(host));
    const sequential = panels.length === 0;
    const main = root.closest("main");
    const moods = main?.querySelectorAll<HTMLElement>("[data-offline-mood]") ?? [];
    const nightMood = main?.querySelector<HTMLElement>(".offline-mood-night") ?? null;
    const depths = main?.querySelectorAll<HTMLElement>("[data-water-depth]") ?? [];
    const threads = steps.map((_, i) => (hosts[i] ?? steps[i]).querySelectorAll<SVGPathElement>(".thread-path, .thread-shadow"));
    const statement = part.querySelector<HTMLElement>(".sunset-statement");
    const route = part.querySelector<HTMLElement>(".memory-journey-route");
    const effectElements = hosts.map((host) => Array.from(host.querySelectorAll<HTMLElement>(EFFECT_SELECTOR)));
    const revealElements = steps.map((step) => Array.from(step.querySelectorAll<HTMLElement>("[data-step-reveal]")));
    // `--reveal` is registered as non-inherited, so word-mode copy hands it to each word, title word and ink mark
    // itself, and only while that piece is actually moving: a paragraph mid-reveal restyles the half-dozen words in
    // its ink window instead of all of them. The CSS formulas stay the source of truth; these mirror them only to know
    // when a piece's value changes (lead = its index, base/span = the formula's word count and window).
    const wordPieces = revealElements.map((elements) => elements.map((element) => {
      if (element.dataset.stepReveal !== "words") return [];
      const read = (target: HTMLElement | null, name: string) => Number(target?.style.getPropertyValue(name)) || 0;
      const words = read(element, "--words") || 1;
      const pieces: { element: HTMLElement; lead: number; base: number; span: number }[] = [];
      element.querySelectorAll<HTMLElement>(".story-word").forEach((word) => pieces.push({ element: word, lead: read(word, "--i"), base: words + 6, span: 6 }));
      element.querySelectorAll<HTMLElement>(".story-title-word > span").forEach((inner) => pieces.push({ element: inner, lead: read(inner.parentElement, "--i"), base: words + 2, span: 2 }));
      element.querySelectorAll<HTMLElement>(".story-ink-mark").forEach((mark) => pieces.push({ element: mark, lead: read(mark, "--mi"), base: words + 6, span: read(mark, "--mn") + 5 }));
      return pieces;
    }));
    if (!steps.length) return;

    // quickSetter avoids allocating tweens or reading layout on every scroll frame.
    // Restore the original inline styles as these setters also touch elements outside scope.
    const animated = [
      ...moods, ...panels, ...depths, ...threads.flatMap((paths) => Array.from(paths)), ...(statement ? [statement] : []), ...(route ? [route] : []),
      ...(stack ? [stack] : []), ...effectElements.flat(), ...revealElements.flat(), ...wordPieces.flat(2).map((piece) => piece.element),
    ];
    const originalStyles = animated.map((element) => element.getAttribute("style"));
    // Register transform ownership with the GSAP context before using quickSetters.
    // Its revert restores both CSS and the transform cache when mobile DOM is reused.
    if (!reducedMotion) {
      gsap.set([...panels, ...depths, ...effectElements.flat(), ...revealElements.flat()], { x: "+=0" });
    } else {
      gsap.set(revealElements.flat(), { opacity: 1, "--reveal": 1 });
      // Part I's chapters carry no per-scene thread; an empty target would only earn a console warning.
      const threadPaths = threads.flatMap((paths) => Array.from(paths));
      if (threadPaths.length) gsap.set(threadPaths, { strokeDashoffset: 0 });
    }
    // Fully faded skies are also hidden (and their idle loops paused via CSS), so only the skies in view cost anything.
    const moodSetters = Array.from(moods, (mood) => quickNumber(mood, "opacity", 0.001));
    const moodHidden = Array.from(moods, () => false);
    let nightHidden = false;
    const panelHidden = panels.map(() => false);
    // The route's rule and traveler glide with the dissolve instead of jumping at the scrollama step.
    const routeSetter = route ? quickNumber(route, "--route-scroll", 0.0001) : undefined;
    const panelSetters = panels.map((panel) => ({
      alpha: quickNumber(panel, "opacity", 0.0001),
      visibility: memoString(gsap.quickSetter(panel, "visibility") as (value: string) => void),
      y: quickNumber(panel, "y", 0.01, "px"),
      scaleX: quickNumber(panel, "scaleX", 0.00001),
      scaleY: quickNumber(panel, "scaleY", 0.00001),
    }));
    // These four are registered as non-inherited in CSS, so a change restyles the stack (and its light leak), not every prop.
    const stackSetters = stack && !reducedMotion ? {
      leak: quickNumber(stack, "--leak", 0.001),
      leakX: quickNumber(stack, "--leak-x", 0.1),
      blur: quickNumber(stack, "--vblur", 0.01, "px"),
      skew: quickNumber(stack, "--vskew", 0.001, "deg"),
    } : null;
    // Scroll speed reads as a little motion blur on the stage; a ticker eases it back to stillness once the reader stops.
    let velocity = 0;
    let lastPosition = 0;
    let lastTime = 0;
    const tickSpeed = () => {
      velocity *= 0.86;
      if (Math.abs(velocity) < 0.004) velocity = 0;
      const v = Math.max(-1, Math.min(1, velocity / 2.4));
      stackSetters?.blur(Math.abs(v) * 2.6);
      stackSetters?.skew(v * 0.5);
    };
    if (stackSetters && !mobile) gsap.ticker.add(tickSpeed);
    const threadSetters = threads.map((paths) => quickNumber(paths, "strokeDashoffset", 0.0001));
    const depthSetters = Array.from(depths, (depth) => quickNumber(depth, "y", 0.01, "px"));
    const depthRates = Array.from(depths, (depth) => Number(depth.dataset.waterDepth));
    const statementSetter = statement ? quickNumber(statement, "opacity", 0.001) : undefined;
    const effects = reducedMotion ? [] : effectElements.map((elements) => elements.map(readEffect));
    // Keep photos and captions sharp throughout the dissolve.
    if (panels.length) gsap.set(panels, { filter: "none" });
    const skip: NumberSetter = () => {};
    const reveals = revealElements.map((elements) => elements.map((element) => ({
      // Word-mode copy keeps its own opacity and lets CSS cascade the words from `--reveal`.
      words: element.dataset.stepReveal === "words",
      // `--reveal` inherits into the whole block, so only write it where something reads it: words and the quote's
      // stroke. An eyebrow or an album would restyle every descendant on every frame of its reveal for nothing.
      reveal: element.dataset.stepReveal === "words" || element.querySelector(".story-quote-stroke") ? quickNumber(element, "--reveal", 0.001) : skip,
      opacity: quickNumber(element, "opacity", 0.001),
      y: quickNumber(element, "y", 0.01, "px"),
      filter: memoString(gsap.quickSetter(element, "filter") as (value: string) => void),
    })));
    const pieceSetters = wordPieces.map((elements) => elements.map((pieces) => pieces.map((piece) => {
      const set = gsap.quickSetter(piece.element, "--reveal") as NumberSetter;
      let shown = Number.NaN;
      return (reveal: number) => {
        // Skip pieces whose own value would not move: the words outside the ink window are fully dry or not yet written.
        const value = Math.round(clampProgress((reveal * piece.base - piece.lead) / piece.span) * 1000);
        if (value === shown) return;
        shown = value;
        set(Math.round(reveal * 10000) / 10000);
      };
    })));
    let boundaries: number[] = [];
    let starts: number[] = [];
    let heights: number[] = [];
    let hostTops: number[] = [];
    let hostHeights: number[] = [];
    let hostWidths: number[] = [];
    let revealTops: number[][] = [];
    let travel = 1;
    let viewport = window.innerHeight;
    // The progress each host's props were last painted at; a host whose progress has not moved needs no work.
    let paintedAt: string[] = [];
    // Part II keeps Part I's per-scene thread in the DOM but hidden; drawing an invisible thread is pure style work.
    let threadShown: boolean[] = [];
    const driver = { progress: 0 };
    let mounted = true;
    const paint = () => {
      // The scrub tween can deliver one last frame after cleanup; never repaint over restored styles.
      if (!mounted) return;
      const position = driver.progress * travel;
      const blend = sceneBlend(position, boundaries, viewport * (partTwoMotion.entrance - partTwoMotion.settle));
      moodSetters.forEach((set, i) => {
        // A sky fully covered by the next one is hidden as well, so at most two skies ever paint.
        const covered = (blend[i + 1] ?? 0) >= 1;
        const alpha = covered ? 0 : (blend[i] ?? 0);
        set(alpha);
        const hidden = alpha <= 0;
        if (hidden !== moodHidden[i]) {
          moodHidden[i] = hidden;
          moods[i].classList.toggle("is-hidden", hidden);
        }
      });
      if (nightMood) {
        const hidden = (blend[0] ?? 0) >= 1;
        if (hidden !== nightHidden) {
          nightHidden = hidden;
          nightMood.classList.toggle("is-hidden", hidden);
        }
      }
      routeSetter?.(blend.reduce((sum, value) => sum + value, 0) / Math.max(1, steps.length - 1));
      // Reduced motion keeps the authored scene poses and fully readable copy.
      if (reducedMotion) return;
      const now = performance.now();
      if (lastTime) {
        const raw = (position - lastPosition) / Math.max(8, now - lastTime);
        velocity = velocity * 0.5 + Math.max(-6, Math.min(6, raw)) * 0.5;
      }
      lastPosition = position;
      lastTime = now;
      let sunsetLocal = 0;
      let handoff = 0;
      hosts.forEach((_, i) => {
        // Sequential canvases progress as they cross the viewport; stage panels follow the scene blend.
        const local = sequential
          ? clampProgress((viewport - (hostTops[i] - position)) / (viewport + hostHeights[i]))
          : clampProgress((position - starts[i] + viewport * partTwoMotion.entrance) / (
            // The last scene spans the remaining travel, so its motion completes exactly when the stage unsticks.
            i === hosts.length - 1 ? Math.max(1, travel - (starts[i] - viewport * partTwoMotion.entrance)) : heights[i] + viewport * partTwoMotion.entrance));
        if (i === hosts.length - 1) sunsetLocal = local;
        // The first stage panel stages its arrival as the reader scrolls it in; later panels arrive on the blend.
        const entered = sequential
          ? clampProgress(local * 2.2)
          : i === 0
            ? smooth(clampProgress((position - (starts[0] - viewport * partTwoMotion.entrance)) / (viewport * (partTwoMotion.entrance - partTwoMotion.settle))))
            : (blend[i - 1] ?? 0);
        const leaving = sequential ? 0 : (blend[i] ?? 0);
        let visible = true;
        if (!sequential) {
          const set = panelSetters[i];
          // Complementary weights keep the stage present throughout the reversible handoff.
          const arrive = i === 0 ? 1 : sceneDissolve(entered);
          const depart = sceneDissolve(leaving);
          const opacity = arrive * (1 - depart);
          set.alpha(opacity);
          set.visibility(opacity > 0 ? "visible" : "hidden");
          set.y((1 - arrive) * partTwoMotion.rise - depart * 6);
          const scale = 0.985 + arrive * 0.015 + depart * 0.01;
          set.scaleX(scale);
          set.scaleY(scale);
          const hidden = opacity <= 0;
          if (hidden !== panelHidden[i]) {
            panelHidden[i] = hidden;
            panels[i].classList.toggle("is-hidden", hidden);
          }
          if (leaving > handoff && leaving < 1) handoff = leaving;
          visible = !hidden;
        }
        // A fully faded panel is invisible, and a host at the progress it was last painted at would get the same values.
        const key = `${local}|${entered}|${leaving}`;
        if (!visible || paintedAt[i] === key) return;
        paintedAt[i] = key;
        const amplitude = sequential ? SEQUENTIAL_AMPLITUDE : { drift: 1, parallax: 1, rise: 1, sink: 1 };
        // Phone canvas size, rather than browser chrome/viewport height, sets its travel.
        const sceneHeight = sequential ? hostHeights[i] : viewport;
        const driftScale = sequential ? Math.min(1, hostWidths[i] / 600) : 1;

        // Props inside the scene move with the reader's progress through that scene.
        const centred = local - 0.5;
        const wavePhase = local * Math.PI * 2 * partTwoMotion.waveCycles;
        for (const fx of effects[i] ?? []) {
          let x = 0;
          let y = 0;
          let rotation = fx.baseRotation;
          let alpha = fx.baseOpacity;
          let scale = 1;
          if (fx.parallax) y -= centred * fx.parallax * sceneHeight * partTwoMotion.parallax * amplitude.parallax;
          if (fx.drift) x += centred * fx.drift * partTwoMotion.drift * amplitude.drift * driftScale;
          if (fx.wave) {
            y += Math.sin(wavePhase + fx.phase) * fx.wave * 0.7;
            // Drifting props lean into the crest and trough of their wave.
            if (fx.drift) rotation += Math.cos(wavePhase + fx.phase) * Math.sign(fx.drift) * 3;
          }
          if (fx.rise) {
            y -= local * fx.rise * sceneHeight * partTwoMotion.riseTravel * amplitude.rise;
            alpha *= 1 - Math.pow(local, 3);
          }
          // Floating props travel upward like bubbles but never fade (jellyfish, lanterns, hearts).
          if (fx.float) y -= local * fx.float * sceneHeight * partTwoMotion.riseTravel * amplitude.rise;
          if (fx.sink) y += local * fx.sink * sceneHeight * partTwoMotion.sinkTravel * amplitude.sink;
          if (fx.spin) rotation += local * fx.spin;
          // Swaying props rock on the same wave, in degrees of amplitude (kelp tips, hanging lamps).
          if (fx.sway) rotation += Math.sin(wavePhase + fx.phase) * fx.sway;
          // Zooming props grow (or shrink, negative) across the scene, as a share of their size.
          if (fx.zoom) scale *= 1 + centred * fx.zoom;
          if (fx.glow) alpha *= clampProgress(local * 2.4);
          if (fx.tilt) rotation += (1 - entered) * fx.tilt;
          if (fx.delay) {
            // Small staggered arrivals keep the photo as the visual anchor.
            // Later panels already dissolve as a whole; let their photos settle early.
            const staggerProgress = sequential || i === 0 ? entered : clampProgress(entered * 1.8);
            const arrival = easeOut(clampProgress((staggerProgress - fx.delay) / (1 - fx.delay)));
            alpha *= smooth(arrival);
            scale *= 0.95 + arrival * 0.05;
            y += (1 - arrival) * 12;
            // Development runs on the slower, unaccelerated entrance so the photo is visible but still milky
            // for most of the handoff, and only fully sharp once the scene has settled.
            fx.develop?.(smooth(clampProgress((entered - fx.delay * 0.6) / (1 - fx.delay * 0.6))));
          }
          // Fading props appear (positive) or disappear (negative) at a point in the scene: the sun's dusk, a second photo.
          if (fx.fade) {
            const t = smooth(clampProgress((local - Math.abs(fx.fade)) / 0.18));
            alpha *= fx.fade > 0 ? t : 1 - t;
          }
          fx.x(x);
          fx.y(y);
          fx.rotation(rotation);
          fx.scale(scale);
          if (fx.rise || fx.glow || fx.delay || fx.fade) fx.opacity(alpha);
          fx.sheenX?.(-70 + local * 190);
        }
      });
      // A warm light leak crosses the stage while one scene hands off to the next, like light catching film.
      if (stackSetters) {
        stackSetters.leak(handoff > 0 ? Math.sin(Math.PI * handoff) : 0);
        stackSetters.leakX(-70 + handoff * 240);
      }
      threadSetters.forEach((set, i) => {
        if (!threadShown[i]) return;
        const draw = clampProgress((position - starts[i] + viewport * 0.8) / (heights[i] + viewport * 0.1));
        set(1 - draw);
      });
      // Copy settles before the eye line; its measured top never includes this rise.
      reveals.forEach((sets, i) => {
        sets.forEach((set, k) => {
          const top = (revealTops[i]?.[k] ?? starts[i]) - position;
          const eased = readingRevealProgress(top, viewport, k, mobile);
          set.reveal(eased);
          if (set.words) {
            set.opacity(1); set.y((1 - eased) * (mobile ? 0 : 4)); set.filter("none");
            for (const setPiece of pieceSetters[i][k]) setPiece(eased);
            return;
          }
          set.opacity(eased);
          set.y((1 - eased) * (mobile ? 7 : 14));
          set.filter("none");
        });
      });
      if (!mobile) {
        depthSetters.forEach((set, i) => set(-driver.progress * partTwoMotion.depth * depthRates[i]));
        // The closing line lands last, once the sun has set.
        statementSetter?.(clampProgress((sunsetLocal - 0.62) / 0.3));
      }
    };
    // Where the part sat when the engine last measured it; an image load that leaves this unchanged needs no refresh.
    const readLayout = () => `${part.offsetHeight}|${Math.round(part.getBoundingClientRect().top + window.scrollY)}|${window.innerWidth}x${window.innerHeight}`;
    let measuredLayout = "";
    const measure = (trigger: ScrollTrigger) => {
      measuredLayout = readLayout();
      viewport = window.innerHeight;
      travel = Math.max(1, trigger.end - trigger.start);
      starts = steps.map((step) => step.getBoundingClientRect().top + window.scrollY - trigger.start);
      heights = steps.map((step) => step.offsetHeight);
      hostTops = hosts.map((host) => host.getBoundingClientRect().top + window.scrollY - trigger.start);
      hostHeights = hosts.map((host) => host.offsetHeight);
      hostWidths = hosts.map((host) => host.offsetWidth);
      // A font/image/viewport refresh can occur while copy is translated. Reset all
      // reveal transforms before measuring or each refresh adds that rise to its baseline.
      reveals.forEach((sets) => sets.forEach((set) => set.y(0)));
      // A refresh can jump the position; never read that jump as scroll speed.
      lastTime = 0;
      // Past the part's end the engine no longer paints, so copy too near the end to reach the reading line before then
      // (a short last paragraph with nothing after it) counts as a little higher, and is whole by the time the part ends.
      const latestTop = travel + viewport * 0.92 - viewport * (mobile ? 0.18 : 0.26) * 1.1;
      revealTops = revealElements.map((elements) => elements.map((element) => Math.min(element.getBoundingClientRect().top + window.scrollY - trigger.start, latestTop)));
      boundaries = starts.slice(1).map((start) => start - viewport * partTwoMotion.entrance);
      paintedAt = [];
      threadShown = threads.map((paths) => paths.length > 0 && getComputedStyle(paths[0]).visibility !== "hidden");
      paint();
    };
    gsap.to(driver, {
      progress: 1, ease: "none", onUpdate: paint,
      scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: true, onRefresh: measure },
    });

    // A resize or a font swap always re-measures. Photos fire `load` here as they stream in while the reader scrolls,
    // but nearly all of them sit in fixed-ratio frames: those only re-measure the engine if the part actually moved.
    let refreshFrame = 0;
    let forceRefresh = false;
    const scheduleRefresh = (force: boolean) => {
      forceRefresh ||= force;
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        const forced = forceRefresh;
        forceRefresh = false;
        if (!forced && readLayout() === measuredLayout) return;
        ScrollTrigger.refresh();
      });
    };
    const refresh = () => scheduleRefresh(true);
    const refreshIfMoved = () => scheduleRefresh(false);
    const observer = new ResizeObserver(refresh);
    observer.observe(part);
    root.addEventListener("load", refreshIfMoved, true);
    void document.fonts?.ready.then(() => { if (mounted) refresh(); });
    return () => {
      mounted = false;
      gsap.ticker.remove(tickSpeed);
      observer.disconnect();
      root.removeEventListener("load", refreshIfMoved, true);
      cancelAnimationFrame(refreshFrame);
      moods.forEach((mood) => mood.classList.remove("is-hidden"));
      nightMood?.classList.remove("is-hidden");
      panels.forEach((panel) => panel.classList.remove("is-hidden"));
      animated.forEach((element, i) => {
        const style = originalStyles[i];
        if (style === null) element.removeAttribute("style");
        else element.setAttribute("style", style);
      });
    };
  }, { scope, dependencies: [mobile, reducedMotion], revertOnUpdate: true });
}
