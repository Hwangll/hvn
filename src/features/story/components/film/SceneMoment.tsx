import { Flame, Gamepad2, Wind, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import type { StoryScrollItem } from "../../data/story";
import type { SoundCue } from "../../../../shared/hooks/useSoundToggle";
import { PetSprite } from "../atoms/PartThreeSprites";
import { url, useIds } from "../atoms/spriteIds";

/*
 * The moments a reader can touch in Part III's scenes. Each sits beside its scene (the scene itself is a picture,
 * hidden from assistive tech), in the same panel or phone card, so it has a real button; the scene answers through
 * CSS (:has() on the panel, story-part-three-film.css), and the drawn thing itself (the cake, the claw machine) can be
 * tapped too. The rainy window of the karaoke night is wiped right in the scene (RainWipe).
 */

interface MomentProps {
  playCue?: (cue: SoundCue) => void;
}

/** A spread that never clumps: the golden ratio's steps round the circle, as a seeded stand-in for chance. */
const spread = (index: number, salt = 0) => ((index + 1) * 0.6180339887 + salt) % 1;

const tones = ["#ffd24a", "#ff4a5a", "#fbefe6", "#ff9ab4", "#f3c77e", "#e0263f"];
const shapes = ["is-strip", "is-square", "is-round", "is-strip", "is-ribbon"];

/**
 * The confetti out of one party popper, aimed up and inward over the table: each piece leaves the popper's mouth at its
 * own angle and speed, slows, turns over and over, and drifts down. The right-hand popper plays the same burst mirrored.
 */
const burst = Array.from({ length: 30 }, (_, index) => {
  const angle = ((16 + spread(index) * 48) * Math.PI) / 180;
  const reach = 18 + spread(index, 0.37) * 30;
  return {
    className: shapes[index % shapes.length],
    style: {
      "--dx": (Math.cos(angle) * reach).toFixed(2),
      "--dy": (-Math.sin(angle) * reach).toFixed(2),
      "--fall": (42 + spread(index, 0.71) * 40).toFixed(1),
      "--spin": `${Math.round((index % 2 ? 1 : -1) * (200 + spread(index, 0.13) * 340))}deg`,
      "--flip": `${(0.45 + spread(index, 0.53) * 0.5).toFixed(2)}s`,
      "--wait": `${(spread(index, 0.29) * 0.14).toFixed(3)}s`,
      "--tone": tones[index % tones.length],
    } as CSSProperties,
  };
});

/** Curling streamers thrown out of each popper, drawn on as they fly. */
const streamers = [
  { d: "M0 100 C10 80 24 86 26 66 C28 48 14 44 26 28 C34 18 46 24 52 8", tone: "#ff4a5a" },
  { d: "M0 100 C18 94 24 74 42 76 C58 78 54 58 70 54 C82 51 84 40 96 36", tone: "#ffd24a" },
  { d: "M0 100 C4 84 -2 70 10 60 C20 52 32 60 36 44 C38 36 32 30 38 20", tone: "#ff9ab4" },
];

/** Tapping the drawn thing (the cake, the machine) does what its button does. */
function useSceneTarget(rootRef: RefObject<HTMLElement | null>, selector: string, onTap: () => void) {
  useEffect(() => {
    const host = rootRef.current?.parentElement;
    if (!host) return undefined;
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest(selector)) onTap();
    };
    host.addEventListener("click", onClick);
    return () => host.removeEventListener("click", onClick);
  }, [onTap, rootRef, selector]);
}

/**
 * 1/10: make a wish and blow the candles out. A breath crosses the cake, the flames lean and go out one by one and
 * their smoke curls up, the room's lights dip, both poppers go off, and the page she left for him breaks its seal and
 * opens. Pressed again, the candles light again.
 */
function CandleMoment({ playCue }: MomentProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Every other press blows them out; each blowing gets its own burst, each lighting its own spark.
  const [presses, setPresses] = useState(0);
  const blown = presses % 2 === 1;
  const onTap = useCallback(() => {
    playCue?.("keepsakeCandle");
    setPresses((count) => count + 1);
  }, [playCue]);
  useSceneTarget(rootRef, ".p3-cake", onTap);

  return (
    <div className={`scene-moment moment-candles ${blown ? "is-blown" : presses ? "is-relit" : ""}`.trim()} ref={rootRef}>
      {blown ? (
        <div className="moment-confetti" key={presses} aria-hidden="true">
          <svg className="moment-breath" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0 18 C20 10 36 22 56 14 C70 8 84 14 100 10" pathLength={1} />
            <path d="M2 26 C24 18 40 28 60 20 C74 15 88 20 100 18" pathLength={1} style={{ "--wait": "0.07s" } as CSSProperties} />
            <path d="M0 9 C18 3 34 13 52 7 C68 2 84 7 98 3" pathLength={1} style={{ "--wait": "0.13s" } as CSSProperties} />
          </svg>
          {["is-left", "is-right"].map((side) => (
            <span className={`moment-burst ${side}`} key={side}>
              <svg className="moment-streamers" viewBox="0 0 100 100">
                {streamers.map((streamer, index) => (
                  <path d={streamer.d} pathLength={1} stroke={streamer.tone} key={streamer.d} style={{ "--wait": `${0.42 + index * 0.05}s` } as CSSProperties} />
                ))}
              </svg>
              {burst.map((piece, index) => <i className={piece.className} style={piece.style} key={index}><b /></i>)}
            </span>
          ))}
        </div>
      ) : null}
      <button className="moment-button" type="button" aria-pressed={blown} onClick={onTap}>
        {blown ? <Flame aria-hidden="true" size={15} /> : <Wind aria-hidden="true" size={15} />}
        {blown ? "Thắp lại nến" : "Ước đi rồi thổi nến"}
      </button>
    </div>
  );
}

type ClawPhase = "ready" | "aim" | "drop" | "won" | "leaving" | "kept";

/** The machine's clock, in ms: the claw's run from the drop to Bơ out of the prize door, then a moment to see it. */
const CLAW_RUN = 3800;
const CLAW_SHOW = 1900;
const CLAW_LEAVE = 450;
/** Where the claw swings while the player aims (along the rail, in the drawing's units), and how long a swing takes. */
const AIM = { from: 58, to: 166, period: 2100 };

/** The plush in the case, by the drawing's units: [x, y, radius, tone, shape]. Bơ sits on the pile at the right. */
const pile: Array<[number, number, number, string, "ball" | "heart" | "star"]> = [
  [36, 184, 9, "#7ac8ff", "ball"], [56, 186, 8, "#ffd24a", "star"], [74, 182, 10, "#ff7aa8", "heart"], [94, 186, 9, "#9be0c4", "ball"],
  [112, 184, 9, "#c9a8ff", "ball"], [152, 186, 9, "#ff7aa8", "ball"], [168, 182, 9, "#ffd24a", "star"], [84, 170, 8, "#ffffff", "ball"],
  [104, 168, 8, "#ff9a5a", "heart"], [160, 168, 7, "#7ac8ff", "ball"],
];

const heart = (x: number, y: number, r: number) =>
  `M${x} ${y + r * 0.9} C${x - r * 1.3} ${y} ${x - r * 1.1} ${y - r} ${x - r * 0.45} ${y - r} C${x - r * 0.1} ${y - r} ${x} ${y - r * 0.7} ${x} ${y - r * 0.5} C${x} ${y - r * 0.7} ${x + r * 0.1} ${y - r} ${x + r * 0.45} ${y - r} C${x + r * 1.1} ${y - r} ${x + r * 1.3} ${y} ${x} ${y + r * 0.9} Z`;
const star = (x: number, y: number, r: number) =>
  `M${Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const reach = i % 2 ? r * 0.5 : r;
    return `${(x + Math.cos(angle) * reach).toFixed(1)} ${(y + Math.sin(angle) * reach).toFixed(1)}`;
  }).join(" L")} Z`;

/** The bulbs round the marquee, lit in two alternating sets. */
const bulbs = [
  ...Array.from({ length: 9 }, (_, i) => [30 + i * 17.5, 15]),
  ...Array.from({ length: 9 }, (_, i) => [30 + i * 17.5, 47]),
  [19, 31], [181, 31],
];

/**
 * Playik's claw machine, close up: the marquee in chasing lights, the case of plush with Bơ on top of the pile, the
 * claw on its rail, the chute and the prize door, the joystick and the button. The claw's run is CSS (.claw-game.is-drop):
 * it comes down where the player let go and, love being what it is, drifts onto Bơ on the way.
 */
function ClawMachine() {
  const id = useIds();
  return (
    <svg className="cg-machine" viewBox="0 0 200 280" aria-hidden="true">
      <defs>
        <linearGradient id={id("cabinet")}>
          <stop offset="0" stopColor="#8a1440" />
          <stop offset="0.22" stopColor="#ff5e92" />
          <stop offset="0.55" stopColor="#ec3a72" />
          <stop offset="1" stopColor="#8a1440" />
        </linearGradient>
        <linearGradient id={id("marquee")} x2="0" y2="1">
          <stop offset="0" stopColor="#fff4c8" />
          <stop offset="1" stopColor="#ffc24a" />
        </linearGradient>
        <linearGradient id={id("case")} x2="0" y2="1">
          <stop offset="0" stopColor="#2a0a3a" />
          <stop offset="0.6" stopColor="#4a1652" />
          <stop offset="1" stopColor="#6a1e5e" />
        </linearGradient>
        <linearGradient id={id("chrome")} x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#a89aa0" />
          <stop offset="1" stopColor="#5a4a50" />
        </linearGradient>
        <radialGradient id={id("plush")} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#2a0a3a" stopOpacity="0.35" />
        </radialGradient>
        <radialGradient id={id("button")} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ffb3c0" />
          <stop offset="0.5" stopColor="#ff2e52" />
          <stop offset="1" stopColor="#9a0a26" />
        </radialGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("window")}><rect x="22" y="58" width="156" height="136" rx="4" /></clipPath>
      </defs>
      {/* The cabinet, its rim catching the neon. */}
      <rect x="8" y="6" width="184" height="270" rx="16" fill={url(id("cabinet"))} />
      <rect className="cg-rim" x="8.6" y="6.6" width="182.8" height="268.8" rx="15.4" />
      <rect x="20" y="13" width="160" height="36" rx="9" fill="#5a0a2a" />
      <rect x="25" y="18" width="150" height="26" rx="6" fill={url(id("marquee"))} />
      <text className="cg-name" x="100" y="37.5" textAnchor="middle">PLAYIK</text>
      {bulbs.map(([cx, cy], index) => <circle className={`cg-bulb ${index % 2 ? "is-b" : "is-a"}`} cx={cx} cy={cy} r="2.2" key={`${cx}-${cy}`} />)}
      {/* The case. */}
      <rect x="18" y="54" width="164" height="144" rx="7" fill="#16041e" />
      <g clipPath={url(id("window"))}>
        <rect x="22" y="58" width="156" height="136" fill={url(id("case"))} />
        <ellipse className="cg-backlight" cx="112" cy="150" rx="70" ry="44" />
        {[[40, 80], [70, 72], [150, 78], [166, 102], [128, 94], [52, 110]].map(([cx, cy]) => <circle className="cg-twinkle" cx={cx} cy={cy} r="0.9" key={`${cx}-${cy}`} />)}
        {/* The chute in the near corner, a clear box over the hole the prizes drop down. */}
        <rect className="cg-chute" x="25" y="138" width="42" height="58" rx="2" />
        <path className="cg-chute-edge" d="M25 138 H67" />
        {pile.map(([x, y, r, tone, shape]) => (
          <g className="cg-plush" key={`${x}-${y}`} style={{ "--tone": tone } as CSSProperties}>
            {shape === "ball" ? <circle cx={x} cy={y} r={r} /> : <path d={shape === "heart" ? heart(x, y, r) : star(x, y, r * 1.15)} />}
            {shape === "ball" ? <circle cx={x} cy={y} r={r} fill={url(id("plush"))} /> : null}
            {shape === "ball" ? <path className="cg-seam" d={`M${x - r * 0.8} ${y - r * 0.2} Q${x} ${y + r * 0.5} ${x + r * 0.8} ${y - r * 0.2}`} /> : null}
          </g>
        ))}
        <g className="cg-bo">
          <PetSprite x={118} y={150} width={30} height={28} />
        </g>
        {/* The claw: a carriage on the rail, the cable it pays out, the head with three prongs, and whatever it holds. */}
        <rect x="24" y="62" width="152" height="5" rx="2.5" fill={url(id("chrome"))} />
        <g className="cg-carriage">
          <rect x="91" y="59" width="18" height="11" rx="2.5" fill={url(id("chrome"))} />
          <path className="cg-cable" d="M100 70 V150" />
          <g className="cg-head">
            <g className="cg-held">
              <PetSprite x={85} y={78} width={30} height={28} />
            </g>
            <path className="cg-prong is-left" d="M97 79 C89 84 86 92 90 101" />
            <path className="cg-prong is-right" d="M103 79 C111 84 114 92 110 101" />
            <path className="cg-prong is-back" d="M100 80 V99" />
            <circle cx="100" cy="76" r="5.4" fill={url(id("chrome"))} />
            <circle className="cg-hub" cx="100" cy="76" r="1.8" />
          </g>
        </g>
        <g className="cg-falling">
          <PetSprite x={31} y={78} width={30} height={28} />
        </g>
        <rect x="22" y="58" width="156" height="136" fill={url(id("glass"))} />
        <path className="cg-glint" d="M150 60 L120 194 M160 60 L130 194" />
      </g>
      {/* The controls: the joystick, the slot for a single go, the big button. */}
      <rect x="18" y="204" width="164" height="32" rx="7" fill="#3a0a22" />
      <circle cx="52" cy="222" r="7" fill="#1a0610" />
      <path className="cg-stick" d="M52 222 L56 208" />
      <circle cx="56.5" cy="207" r="5.2" fill={url(id("button"))} />
      <rect x="88" y="212" width="24" height="16" rx="3" fill="#1a0610" />
      <path className="cg-slot" d="M95 220 H105" />
      <text className="cg-small" x="100" y="233.5" textAnchor="middle">1 LƯỢT</text>
      <circle className="cg-button-glow" cx="146" cy="220" r="12" />
      <circle cx="146" cy="220" r="9.5" fill={url(id("button"))} />
      {/* The prize door, where Bơ comes out, and a grille for the machine's music. */}
      <rect x="24" y="244" width="60" height="26" rx="6" fill="#2a0618" />
      <rect className="cg-flap" x="28" y="247" width="52" height="7" rx="3" />
      <text className="cg-small" x="94" y="261">← LẤY QUÀ</text>
      {[150, 158, 166, 174].map((x) => <path className="cg-grille" d={`M${x} 248 V266`} key={x} />)}
      <g className="cg-prize">
        <g className="cg-sparkles">
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * Math.PI) / 4;
            return <path key={i} d={`M${(54 + Math.cos(angle) * 22).toFixed(1)} ${(250 + Math.sin(angle) * 22).toFixed(1)} L${(54 + Math.cos(angle) * 30).toFixed(1)} ${(250 + Math.sin(angle) * 30).toFixed(1)}`} />;
          })}
        </g>
        <PetSprite x={35} y={232} width={38} height={36} />
      </g>
    </svg>
  );
}

/**
 * 24/9, Playik: one go on the claw machine. Its button (or the drawn machine) brings the machine up close over the
 * scene; the claw swings along its rail until the player lets it drop, comes down, closes on Bơ, carries Bơ to the
 * chute, and Bơ comes out of the prize door. Then the machine goes back into the scene, with Bơ beside it to keep.
 */
function ClawMoment({ playCue }: MomentProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<HTMLDivElement | null>(null);
  const dropRef = useRef<HTMLButtonElement | null>(null);
  const aimRef = useRef((AIM.from + AIM.to) / 2);
  const [phase, setPhase] = useState<ClawPhase>("ready");

  const start = useCallback(() => {
    if (phase !== "ready") return;
    playCue?.("select");
    setPhase("aim");
  }, [phase, playCue]);
  useSceneTarget(rootRef, ".p3-claw", start);

  const drop = () => {
    if (phase !== "aim") return;
    gameRef.current?.style.setProperty("--aim-x", aimRef.current.toFixed(1));
    playCue?.("select");
    setPhase("drop");
  };

  // While aiming, the claw swings along the rail; where it is when the player lets go is where it comes down.
  useEffect(() => {
    if (phase !== "aim") return undefined;
    dropRef.current?.focus({ preventScroll: true });
    if (typeof window.requestAnimationFrame !== "function") return undefined;
    let frame = 0;
    const began = performance.now();
    const swing = (now: number) => {
      // From the middle of the rail (where the CSS puts it before the first frame), out to either end and back.
      const t = ((now - began) / AIM.period) * Math.PI * 2;
      aimRef.current = (AIM.from + AIM.to) / 2 + ((AIM.to - AIM.from) / 2) * Math.sin(t);
      gameRef.current?.style.setProperty("--claw-x", aimRef.current.toFixed(1));
      frame = window.requestAnimationFrame(swing);
    };
    frame = window.requestAnimationFrame(swing);
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

  // The run plays out in CSS; the game only keeps its clock.
  useEffect(() => {
    const next: Partial<Record<ClawPhase, [ClawPhase, number]>> = { drop: ["won", CLAW_RUN], won: ["leaving", CLAW_SHOW], leaving: ["kept", CLAW_LEAVE] };
    const step = next[phase];
    if (!step) return undefined;
    const timer = window.setTimeout(() => {
      if (step[0] === "won") playCue?.("keepsakeStar");
      setPhase(step[0]);
    }, step[1]);
    return () => window.clearTimeout(timer);
  }, [phase, playCue]);

  const playing = phase === "aim" || phase === "drop" || phase === "won" || phase === "leaving";
  const status = phase === "aim" ? "Canh cho chuẩn rồi thả gắp nha" : phase === "drop" ? "Đang gắp…" : "Gắp được Bơ rồi!";
  const label = phase === "ready" ? "Gắp thú · còn 1 lượt" : phase === "kept" ? "Gắp được Bơ rồi!" : "Đang chơi…";

  return (
    <div className={`scene-moment moment-claw is-${phase === "kept" ? "won" : phase === "ready" ? "ready" : "playing"}`} ref={rootRef} data-fade="0.3">
      {phase === "kept" ? (
        <span className="moment-prize" aria-hidden="true">
          <PetSprite />
          <b>Bơ</b>
        </span>
      ) : null}
      <button className="moment-button" type="button" disabled={phase !== "ready"} onClick={start}>
        <Gamepad2 aria-hidden="true" size={15} />
        {label}
      </button>
      {playing ? (
        <div
          className={`claw-game is-${phase} ${phase === "won" || phase === "leaving" ? "is-drop" : ""}`.trim()}
          ref={gameRef}
          role="group"
          aria-label="Máy gắp thú ở Playik"
        >
          <div className="claw-game-stage">
            <ClawMachine />
          </div>
          <div className="claw-game-controls">
            <p className="claw-game-status" aria-live="polite">{status}</p>
            {phase === "aim" || phase === "drop" ? (
              <button className="claw-game-drop" type="button" ref={dropRef} disabled={phase !== "aim"} onClick={drop}>
                Thả gắp!
              </button>
            ) : null}
          </div>
          {phase === "aim" ? (
            <button className="claw-game-close" type="button" aria-label="Đóng máy gắp" onClick={() => setPhase("ready")}>
              <X aria-hidden="true" size={18} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** The touchable moment of a Part III scene, if it has one. */
export function SceneMoment({ chapter, playCue }: { chapter: StoryScrollItem } & MomentProps) {
  if (chapter.threadState === "birthday") return <CandleMoment playCue={playCue} />;
  if (chapter.threadState === "lantern") return <ClawMoment playCue={playCue} />;
  return null;
}
