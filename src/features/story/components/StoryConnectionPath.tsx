import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface StoryConnectionPathProps {
  reducedMotion: boolean;
  continuousBlue?: boolean;
}

interface ThreadMeasure {
  height: number;
  width: number;
  yIntro: number;
  yLost: number;
  yMeet: number;
  yEnd: number;
}

const initialMeasure: ThreadMeasure = {
  height: 5200,
  width: 1440,
  yIntro: 140,
  yLost: 3000,
  yMeet: 3800,
  yEnd: 5000,
};

export function StoryConnectionPath({ reducedMotion, continuousBlue = false }: StoryConnectionPathProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [measure, setMeasure] = useState<ThreadMeasure>(initialMeasure);
  const geometry = useMemo(() => continuousBlue ? createBlueThreadGeometry(measure) : createThreadGeometry(measure), [continuousBlue, measure]);

  useEffect(() => {
    const root = rootRef.current;
    const container = root?.parentElement;
    if (!root || !container) {
      return undefined;
    }

    const updateMeasure = () => {
      const containerRect = container.getBoundingClientRect();
      const relativeY = (selector: string, fallback: number) => {
        const element = container.querySelector<HTMLElement>(selector);
        if (!element) {
          return fallback;
        }
        const rect = element.getBoundingClientRect();
        return rect.top - containerRect.top + rect.height * 0.5;
      };

      setMeasure({
        height: Math.max(container.scrollHeight, window.innerHeight * 1.4, 2400),
        width: Math.max(containerRect.width, window.innerWidth, 1),
        yIntro: relativeY(".story-intro", 160),
        yLost: relativeY("#lost-connection", container.scrollHeight * 0.58),
        yMeet: relativeY("#meet-again", container.scrollHeight * 0.68),
        yEnd: relativeY(".story-ending", container.scrollHeight - window.innerHeight * 0.34),
      });
    };

    updateMeasure();
    window.addEventListener("resize", updateMeasure);

    if (typeof ResizeObserver === "undefined") {
      return () => window.removeEventListener("resize", updateMeasure);
    }

    const resizeObserver = new ResizeObserver(updateMeasure);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMeasure);
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const paths = gsap.utils.toArray<SVGPathElement>(".story-thread-segment", root);
      paths.forEach((path) => {
        const length = continuousBlue ? 1 : path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: reducedMotion ? 0 : length,
        });
      });

      if (reducedMotion) {
        return;
      }

      gsap.to(paths, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.parentElement,
          start: "top 78%",
          end: "bottom 82%",
          scrub: 0.7,
        },
      });
    },
    { scope: rootRef, dependencies: [geometry.animationKey, reducedMotion, continuousBlue], revertOnUpdate: true },
  );

  return (
    <div className="story-connection-thread" ref={rootRef} style={{ height: measure.height }} aria-hidden="true">
      <svg className="story-thread-svg" viewBox={`0 0 100 ${measure.height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="story-thread-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.16 18)" />
            <stop offset="45%" stopColor="oklch(0.82 0.13 350)" />
            <stop offset="100%" stopColor="oklch(0.76 0.13 28)" />
          </linearGradient>
          <filter id="story-thread-soften" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>

        <path className="story-thread-glow" d={geometry.glow} pathLength={1} />
        {geometry.segments.map((segment) => (
          <path className={`story-thread-segment ${segment.className}`} d={segment.d} key={segment.id} pathLength={1} />
        ))}
        {geometry.nodes.map((node) => (
          <g className={`story-thread-node ${node.className}`} key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <circle r={node.r + 1.6} />
            <circle r={node.r} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function createBlueThreadGeometry({ height, width }: ThreadMeasure) {
  const lane = width <= 900 ? 3 : 51;
  const end = height - 80;
  const path = `M${lane} 80 C${lane - 2} ${end * 0.2}, ${lane + 2} ${end * 0.32}, ${lane} ${end * 0.46} S${lane - 2} ${end * 0.74}, ${lane} ${end}`;
  return {
    animationKey: `blue-${Math.round(height)}-${Math.round(width)}`,
    glow: path,
    segments: [{ id: "blue-continuous", className: "is-blue", d: path }],
    nodes: [],
  };
}

function createThreadGeometry(measure: ThreadMeasure) {
  const isMobile = measure.width < 760;
  const isTablet = measure.width >= 760 && measure.width < 1100;
  const isDesktop = !isMobile && !isTablet;
  const top = Math.max(64, measure.yIntro - (isMobile ? 180 : 260));
  const lostStart = Math.max(top + 700, measure.yLost - (isMobile ? 280 : 360));
  const lostEnd = Math.min(measure.height - 900, measure.yLost + (isMobile ? 300 : 380));
  const meetPoint = Math.max(lostEnd + 320, measure.yMeet + (isMobile ? 80 : 140));

  const lane = isMobile
    ? {
        start: 91,
        a: 92,
        b: 14,
        c: 84,
        d: 16,
        end: 50,
      }
      : isTablet
        ? {
            start: 6,
            a: 6,
            b: 83,
            c: 18,
            d: 78,
            end: 50,
          }
        : {
            start: 41.5,
            a: 42,
            b: 43.3,
            c: 41,
            d: 42.9,
            end: 43.2,
          };

  const startPull = Math.max(2, lane.start - (isDesktop ? 1.6 : 5));
  const earlyPull = Math.max(2, lane.a - (isDesktop ? 1.3 : 3));
  const wide = {
    preA: isDesktop ? 2.5 : 9,
    preB: isDesktop ? 0.9 : 4,
    lostA: isDesktop ? 1.7 : 6,
    lostB: isDesktop ? 1.6 : 13,
    lostC: isDesktop ? 1.8 : 6,
    reconnectA: isDesktop ? 1.6 : 8,
    reconnectB: isDesktop ? 2.4 : 10,
    reconnectC: isDesktop ? 2.3 : 12,
    reconnectD: isDesktop ? 1.8 : 7,
    stableA: isDesktop ? 2.1 : 7,
    stableB: isDesktop ? 2.4 : 8,
    stableC: isDesktop ? 1.7 : 6,
    stableD: isDesktop ? 2.2 : 8,
  };

  const pre = [
    `M ${lane.start} ${top}`,
    `C ${startPull} ${top + 180}, ${earlyPull} ${top + 310}, ${lane.a} ${top + 520}`,
    `C ${lane.a + wide.preA} ${top + 820}, ${lane.b + wide.preB} ${lostStart - 520}, ${lane.b} ${lostStart - 190}`,
    `C ${lane.b - 3} ${lostStart - 96}, ${lane.d} ${lostStart - 42}, ${lane.d} ${lostStart}`,
  ].join(" ");

  const lostA = `M ${lane.d} ${lostStart + 38} C ${lane.d + wide.lostA} ${lostStart + 120}, ${lane.d + 1.4} ${lostStart + 190}, ${lane.d - wide.lostA} ${lostStart + 250}`;
  const lostB = `M ${lane.d - 1.4} ${lostStart + 330} C ${lane.d - wide.lostB} ${lostStart + 430}, ${lane.c + wide.lostC} ${lostEnd - 300}, ${lane.c} ${lostEnd - 220}`;
  const lostC = `M ${lane.c + wide.lostC} ${lostEnd - 130} C ${lane.c - 1.4} ${lostEnd - 78}, ${lane.c + wide.lostA} ${lostEnd - 36}, ${lane.c} ${lostEnd}`;

  const reconnect = [
    `M ${lane.c} ${lostEnd + 45}`,
    `C ${lane.c - wide.reconnectA} ${lostEnd + 150}, ${lane.start - wide.reconnectB} ${lostEnd + 250}, ${lane.start} ${lostEnd + 390}`,
    `C ${lane.start + wide.reconnectC} ${lostEnd + 560}, ${lane.d + wide.reconnectD} ${meetPoint - 260}, ${lane.d} ${meetPoint}`,
  ].join(" ");

  const heart = {
    centerX: isMobile ? 50 : isTablet ? 52 : 49,
    topY: Math.min(measure.height - (isMobile ? 340 : 390), Math.max(meetPoint + 820, measure.yEnd - (isMobile ? 540 : 600))),
    width: isMobile ? 28 : isTablet ? 22 : 14,
    height: isMobile ? 250 : isTablet ? 280 : 300,
  };
  const heartStartY = heart.topY + heart.height * 0.28;
  const heartBottomY = heart.topY + heart.height;
  const heartLeftX = heart.centerX - heart.width * 0.5;
  const heartRightX = heart.centerX + heart.width * 0.5;
  const heartNeckX = heart.centerX;

  const stable = [
    `M ${lane.d} ${meetPoint}`,
    `C ${lane.d - wide.stableA} ${meetPoint + 300}, ${lane.a + wide.stableB} ${meetPoint + 520}, ${lane.a} ${meetPoint + 840}`,
    `C ${lane.a - wide.stableC} ${meetPoint + 1180}, ${lane.b + wide.stableD} ${heart.topY - 560}, ${lane.b} ${heart.topY - 360}`,
    `C ${lane.b - wide.stableD} ${heart.topY - 180}, ${heartNeckX - wide.reconnectB} ${heart.topY - 80}, ${heartNeckX} ${heartStartY}`,
  ].join(" ");

  const heartPath = [
    `M ${heartNeckX} ${heartStartY}`,
    `C ${heartLeftX - heart.width * 0.66} ${heart.topY - heart.height * 0.06}, ${heartLeftX - heart.width * 0.92} ${heart.topY + heart.height * 0.3}, ${heartNeckX} ${heartBottomY}`,
    `C ${heartRightX + heart.width * 0.92} ${heart.topY + heart.height * 0.3}, ${heartRightX + heart.width * 0.66} ${heart.topY - heart.height * 0.06}, ${heartNeckX} ${heartStartY}`,
    `M ${heartNeckX} ${heartBottomY}`,
    `C ${heartNeckX + heart.width * 0.06} ${heartBottomY + 42}, ${heartNeckX + heart.width * 0.04} ${heartBottomY + 92}, ${heartNeckX} ${Math.min(measure.height - 80, heartBottomY + 150)}`,
  ].join(" ");

  const segments = [
    { id: "thread-start", className: "is-start", d: pre },
    { id: "thread-lost-a", className: "is-lost", d: lostA },
    { id: "thread-lost-b", className: "is-lost", d: lostB },
    { id: "thread-lost-c", className: "is-lost", d: lostC },
    { id: "thread-reconnect", className: "is-reconnect", d: reconnect },
    { id: "thread-stable", className: "is-stable", d: stable },
    { id: "thread-heart", className: "is-heart", d: heartPath },
  ];

  return {
    animationKey: `${Math.round(measure.height)}-${Math.round(measure.width)}-${Math.round(measure.yLost)}-${Math.round(measure.yMeet)}-${Math.round(measure.yEnd)}`,
    glow: [pre, lostA, lostB, lostC, reconnect, stable, heartPath].join(" "),
    nodes: [
      { id: "thread-dot-start", className: "is-start", x: lane.start, y: top, r: isMobile ? 2.1 : 2.4 },
      { id: "thread-dot-lost", className: "is-lost", x: lane.d, y: lostStart, r: isMobile ? 1.6 : 1.9 },
      { id: "thread-dot-return", className: "is-reconnect", x: lane.start, y: lostEnd + 390, r: isMobile ? 1.8 : 2.2 },
      { id: "thread-dot-end", className: "is-end", x: heartNeckX, y: Math.min(measure.height - 80, heartBottomY + 150), r: isMobile ? 2.2 : 2.6 },
    ],
    segments,
  };
}
