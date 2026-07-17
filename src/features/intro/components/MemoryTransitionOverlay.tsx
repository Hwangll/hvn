import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import type { ExperienceState } from "../../../app/AppShell";

gsap.registerPlugin(useGSAP);

interface MemoryTransitionOverlayProps {
  phase: ExperienceState;
  reducedMotion: boolean;
}

export function MemoryTransitionOverlay({ phase, reducedMotion }: MemoryTransitionOverlayProps) {
  const scope = useRef<HTMLDivElement>(null);
  const isActive = phase === "focusing" || phase === "transitioning" || phase === "story-reveal";

  useGSAP(
    () => {
      if (!scope.current) {
        return;
      }

      const root = scope.current;
      const veil = root.querySelector(".memory-veil");
      const bloom = root.querySelector(".memory-transition-bloom");
      const copy = root.querySelector(".memory-transition-copy");

      if (!isActive) {
        gsap.set(root, { autoAlpha: 0 });
        return;
      }

      if (reducedMotion) {
        gsap.set(root, { autoAlpha: phase === "story-reveal" ? 0 : 1 });
        gsap.set(veil, { opacity: phase === "story-reveal" ? 0 : 0.8, scale: 1 });
        gsap.set(copy, { opacity: 0 });
        return;
      }

      gsap.set(root, { autoAlpha: 1 });

      if (phase === "focusing") {
        gsap.to(veil, { opacity: 0.32, scale: 0.98, duration: 0.48, ease: "power3.out" });
        gsap.to(bloom, { opacity: 0.42, scale: 1.03, duration: 0.58, ease: "power3.out" });
        gsap.to(copy, { opacity: 0, y: 8, duration: 0.28, ease: "power3.out" });
      }

      if (phase === "transitioning") {
        gsap.to(veil, { opacity: 0.92, scale: 1.06, duration: 0.82, ease: "power3.inOut" });
        gsap.to(bloom, { opacity: 0.78, scale: 1.18, duration: 0.9, ease: "power3.inOut" });
        gsap.to(copy, { opacity: 1, y: 0, duration: 0.46, delay: 0.12, ease: "power3.out" });
      }

      if (phase === "story-reveal") {
        gsap.to(copy, { opacity: 0, y: -10, duration: 0.3, ease: "power2.out" });
        gsap.to(veil, { opacity: 0, scale: 1.12, duration: 0.78, ease: "power3.out" });
        gsap.to(bloom, { opacity: 0, scale: 1.28, duration: 0.82, ease: "power3.out" });
        gsap.to(root, { autoAlpha: 0, duration: 0.82, delay: 0.16, ease: "power3.out" });
      }
    },
    { scope, dependencies: [phase, reducedMotion, isActive] },
  );

  return (
    <div className={`memory-transition-overlay ${isActive ? "is-active" : ""}`} ref={scope} aria-hidden={!isActive}>
      <div className="memory-veil" />
      <div className="memory-transition-bloom" />
      <div className="memory-transition-copy">đang mở ký ức...</div>
    </div>
  );
}
