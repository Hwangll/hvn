import { useEffect, useRef, useState } from "react";
import type { KeepsakeId } from "../model/keepsakes";

export type KeepsakeTheme = "blush" | "night";

interface UseThreeKeepsakesOptions {
  reducedMotion: boolean;
  selectedId: KeepsakeId;
  unlockedIds: KeepsakeId[];
  onSelect: (id: KeepsakeId) => void;
  /** Part I opens a blush keepsake box; Part II shows the same box under a blue-hour light. */
  theme?: KeepsakeTheme;
}

export function useThreeKeepsakes({ reducedMotion, selectedId, unlockedIds, onSelect, theme = "blush" }: UseThreeKeepsakesOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedRef = useRef(selectedId);
  const unlockedIdsRef = useRef(unlockedIds);
  const onSelectRef = useRef(onSelect);
  const [supported, setSupported] = useState(() => typeof WebGLRenderingContext !== "undefined");

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    unlockedIdsRef.current = unlockedIds;
  }, [unlockedIds]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return undefined;
    }

    if (reducedMotion || !supported) {
      return undefined;
    }

    // three.js is the heaviest download on the page; fetch it only once the box is a screen or so away,
    // so the story's first paint and scroll engine never wait on it.
    let cancelled = false;
    let teardown: (() => void) | undefined;
    const mount = () => {
      void import("../three/keepsakeScene").then(({ mountKeepsakeScene }) => {
        if (cancelled) return;
        teardown = mountKeepsakeScene(container, canvas, {
          theme,
          selectedRef,
          unlockedIdsRef,
          onSelectRef,
          onUnsupported: () => setSupported(false),
        });
      });
    };
    const approaching = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        approaching?.disconnect();
        mount();
      }, { rootMargin: "150% 0px" });
    if (approaching) approaching.observe(container);
    else mount();

    return () => {
      cancelled = true;
      approaching?.disconnect();
      teardown?.();
    };
  }, [reducedMotion, supported, theme]);

  return { containerRef, canvasRef, supported: supported && !reducedMotion };
}
