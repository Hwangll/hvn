import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useScrollAnimation<T extends HTMLElement>(enabled: boolean) {
  const scope = useRef<T | null>(null);

  useGSAP(
    () => {
      if (!enabled || !scope.current) {
        return;
      }

      const elements = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
      elements.forEach((element) => {
        if (element.closest(".story-part-2")) return;
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
              once: true,
            },
          },
        );
      });

      let refreshFrame = 0;
      let active = true;
      const refresh = () => {
        window.cancelAnimationFrame(refreshFrame);
        refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      scope.current.addEventListener("load", refresh, true);
      void document.fonts?.ready.then(() => {
        if (active) {
          refresh();
        }
      });

      return () => {
        active = false;
        window.cancelAnimationFrame(refreshFrame);
        scope.current?.removeEventListener("load", refresh, true);
      };
    },
    { scope, dependencies: [enabled], revertOnUpdate: true },
  );

  return scope;
}
