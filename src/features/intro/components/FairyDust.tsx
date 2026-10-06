import { useEffect, useRef, type RefObject } from "react";
import { createFairyDust, stageBoxOf, type FairyDust as Dust, type FairyVariant } from "../utils/fairyDust";

interface FairyDustProps {
  variant: FairyVariant;
  /** The story is opening: the dust is drawn into the bouquet. */
  gathering: boolean;
  /** The memory room: the bouquet's frame and the realm's layers are found inside it. */
  rootRef: RefObject<HTMLElement | null>;
}

/** How quickly, per second, the realm's lean catches up with the pointer. */
const LEAN_EASE = 2.6;
/** The shortest time between two frames of dust, in ms: every frame at 60 or 90 Hz, every other one at 120 or 144 Hz. */
const FRAME_GAP = 10;

/**
 * The fairy dust over the memory room (utils/fairyDust.ts) and the realm's lean toward the pointer: the layers marked
 * `data-depth` slide that many px against it, the near ones more, on the same frames as the dust. A touch throws a
 * handful of glitter where it lands. The caller leaves this out for readers who prefer reduced motion.
 */
export function FairyDust({ variant, gathering, rootRef }: FairyDustProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dustRef = useRef<Dust | null>(null);
  const variantRef = useRef(variant);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return undefined;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const dust = createFairyDust(canvas, variantRef.current, !fine || window.innerWidth < 700);
    if (!dust) return undefined;
    dustRef.current = dust;
    const frame = root.querySelector<HTMLElement>(".memory-bouquet-frame");
    const measure = () => {
      if (frame) dust.setStage(stageBoxOf(frame.getBoundingClientRect()));
    };
    measure();
    dust.resize();

    const layers = fine
      ? Array.from(root.querySelectorAll<HTMLElement>(".memory-atmosphere [data-depth]"), (element) => ({ element, depth: Number(element.dataset.depth) || 0, shown: "" }))
      : [];
    let goalX = 0;
    let goalY = 0;
    let leanX = 0;
    let leanY = 0;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      dust.pointer(event.clientX, event.clientY);
      goalX = (event.clientX / window.innerWidth) * 2 - 1;
      goalY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      dust.leave();
      goalX = 0;
      goalY = 0;
    };
    const onDown = (event: PointerEvent) => {
      // Buttons and links spark on their own (clickSparks); anywhere else in the room scatters a little glitter.
      if (event.pointerType !== "touch" && event.target instanceof Element && event.target.closest("button, a")) return;
      dust.burst(event.clientX, event.clientY, event.pointerType === "touch" ? 12 : 14);
    };
    const onResize = () => {
      dust.resize();
      measure();
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerdown", onDown, { passive: true });
    root.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    let last = performance.now();
    let frameId = requestAnimationFrame(function tick(now) {
      frameId = requestAnimationFrame(tick);
      // Drifting light needs no more than about sixty frames a second: on a 120 Hz screen it draws every other frame.
      if (now - last < FRAME_GAP) return;
      const deltaMs = Math.min(50, now - last);
      last = now;
      dust.step(deltaMs);
      if (!layers.length) return;
      const ease = 1 - Math.exp(-(deltaMs / 1000) * LEAN_EASE);
      leanX += (goalX - leanX) * ease;
      leanY += (goalY - leanY) * ease;
      for (const layer of layers) {
        const value = `${(-leanX * layer.depth).toFixed(1)}px ${(-leanY * layer.depth * 0.6).toFixed(1)}px`;
        if (value === layer.shown) continue;
        layer.shown = value;
        layer.element.style.translate = value;
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("scroll", measure);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("resize", onResize);
      layers.forEach((layer) => layer.element.style.removeProperty("translate"));
      dustRef.current = null;
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [rootRef]);

  useEffect(() => {
    variantRef.current = variant;
    dustRef.current?.setVariant(variant);
  }, [variant]);

  useEffect(() => {
    if (gathering) dustRef.current?.gather();
  }, [gathering]);

  return <canvas className="fairy-dust" ref={canvasRef} aria-hidden="true" />;
}
