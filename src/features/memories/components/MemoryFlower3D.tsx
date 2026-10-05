import { useEffect, useRef, useState } from "react";
import type { IntroFlowerVariant } from "../model/introFlowers";
import { mountBouquetStage, type BouquetStage } from "../three/bouquet/stage";
import { BouquetLoader } from "./BouquetLoader";
import { IntroFlowerFallback } from "./IntroFlowerFallback";

interface MemoryFlower3DProps {
  reducedMotion: boolean;
  variant?: IntroFlowerVariant;
}

/**
 * The memory room's keepsake cabinet (see three/bouquet/stage). Both bouquets live in one scene behind one WebGL
 * context; changing parts flies the camera between them instead of rebuilding anything. Until the first frame is drawn a
 * quiet loader holds the space; without WebGL the drawn silhouette stands in.
 */
export function MemoryFlower3D({ reducedMotion, variant = "sunflower" }: MemoryFlower3DProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const stageRef = useRef<BouquetStage | null>(null);
  const selectedVariant = useRef(variant);
  const [supported, setSupported] = useState(() => typeof WebGLRenderingContext !== "undefined");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    selectedVariant.current = variant;
    stageRef.current?.setVariant(variant);
  }, [variant]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supported) return undefined;
    let stage: BouquetStage;
    try {
      stage = mountBouquetStage(container, {
        variant: selectedVariant.current,
        reducedMotion,
        onReady: () => setReady(true),
        onContextLost: () => setSupported(false),
      });
    } catch {
      const timer = window.setTimeout(() => setSupported(false), 0);
      return () => window.clearTimeout(timer);
    }
    stageRef.current = stage;
    return () => {
      stageRef.current = null;
      stage.dispose();
    };
  }, [reducedMotion, supported]);

  return (
    <span
      className={["memory-flower-3d", supported ? "" : "is-fallback", ready ? "is-ready" : ""].filter(Boolean).join(" ")}
      data-flower-variant={variant}
      ref={containerRef}
      aria-hidden="true"
    >
      {!supported ? <IntroFlowerFallback variant={variant} /> : ready ? null : <BouquetLoader />}
    </span>
  );
}
