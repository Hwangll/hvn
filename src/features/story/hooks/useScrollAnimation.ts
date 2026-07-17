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
    },
    { scope, dependencies: [enabled], revertOnUpdate: true },
  );

  return scope;
}
