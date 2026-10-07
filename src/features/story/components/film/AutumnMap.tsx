import { ArrowRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { autumnMapCopy, autumnMapPlaces, type AutumnMapPlace, type StoryScrollItem } from "../../data/story";
import { jumpToStoryTarget } from "../../utils/jumpToStoryTarget";
import { holdStoryScroll } from "../../../../shared/hooks/useLenisScroll";
import { useOnScreen } from "../../../../shared/hooks/useOnScreen";
import { useTuckOnScrollDown } from "../../../../shared/hooks/useTuckOnScrollDown";
import { url, useIds } from "../atoms/spriteIds";
import { routeIcons } from "../routeStops";

const copy = autumnMapCopy;
/** Where the thread ties off once the birthday is read: the one day of the month with no place of its own. */
const KNOT = { x: 240, y: 246 };

/** A loose length of thread from one place to the next, bowed a little to one side and then the other. */
function stitch(from: { x: number; y: number }, to: { x: number; y: number }, index: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const bow = (index % 2 ? 1 : -1) * 0.22;
  const [nx, ny] = [-dy * bow, dx * bow];
  const c1 = `${(from.x + dx / 3 + nx).toFixed(1)} ${(from.y + dy / 3 + ny).toFixed(1)}`;
  const c2 = `${(from.x + (2 * dx) / 3 + nx * 0.6).toFixed(1)} ${(from.y + (2 * dy) / 3 + ny * 0.6).toFixed(1)}`;
  return `M${from.x} ${from.y} C${c1} ${c2} ${to.x} ${to.y}`;
}

const stitches = [...autumnMapPlaces.slice(1), KNOT].map((to, index) => stitch(autumnMapPlaces[index], to, index));
const ROAD = "M48 312 C104 276 166 228 238 166 C262 146 280 136 300 128";

/**
 * The hand-drawn city under the thread, in ink and watercolour: the river and the lakes (Hồ Tây, Hồ Gươm, and the
 * little lake at Văn Quán), the parks round Ba Đình, a few roads (Nguyễn Trãi named along its curve), the districts, a
 * compass, and a postmark in the corner. The ink wavers a little, as a pen's does.
 */
function MapArt() {
  const id = useIds();
  return (
    <>
      <defs>
        <filter id={id("pen")} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
        <path id={id("road")} d={ROAD} />
        <path id={id("ring")} d="M366 46 m-17.5 0 a17.5 17.5 0 1 1 35 0 a17.5 17.5 0 1 1 -35 0" />
      </defs>
      <g className="map-art" filter={url(id("pen"))}>
        <path className="map-river-bleed" d="M302 -10 C318 38 342 72 338 122 C334 170 352 212 360 252 C368 292 384 330 404 372" />
        <path className="map-river" d="M302 -10 C318 38 342 72 338 122 C334 170 352 212 360 252 C368 292 384 330 404 372" />
        <path className="map-river-edge" d="M294 -10 C308 40 332 74 328 122 C324 172 342 214 350 254 C358 294 374 334 394 372" />
        <path className="map-river-edge" d="M312 -10 C328 36 352 70 348 122 C344 168 362 210 370 250 C378 290 394 326 414 370" />
        <text className="map-water-name" transform="translate(376 214) rotate(76)">Sông Hồng</text>
        <path className="map-park" d="M218 84 C230 76 252 80 254 92 C256 104 240 112 226 108 C212 104 208 92 218 84 Z" />
        <path className="map-park" d="M164 134 C172 128 186 132 186 140 C186 148 174 152 166 148 C158 144 158 138 164 134 Z" />
        <path className="map-lake" d="M150 52 C152 28 186 14 216 19 C248 24 264 40 257 61 C250 81 222 89 195 85 C170 81 148 72 150 52 Z" />
        <text className="map-water-name" x="204" y="56" textAnchor="middle">Hồ Tây</text>
        <path className="map-lake" d="M272 128 C268 120 276 112 282 116 C288 120 288 134 284 144 C280 152 272 148 272 140 Z" />
        <text className="map-water-name is-small" x="292" y="136">Hồ Gươm</text>
        <path className="map-lake" d="M150 290 C150 283 160 280 168 282 C176 284 178 292 172 297 C166 301 152 298 150 290 Z" />
        <text className="map-water-name is-small" x="164" y="312" textAnchor="middle">hồ Văn Quán</text>
        <path className="map-road" d={ROAD} />
        <path className="map-road" d="M20 196 C96 184 186 150 262 112 C284 100 304 96 330 96" />
        <path className="map-road" d="M206 372 C214 310 246 240 270 182 C278 160 280 150 282 146" />
        <path className="map-road" d="M100 372 C126 318 144 266 150 216 C154 186 168 160 184 140" />
        <path className="map-road is-ring" d="M118 116 C112 176 148 246 232 284 C278 304 318 298 340 284" />
        <text className="map-road-name"><textPath href={`#${id("road")}`} startOffset="22%">Nguyễn Trãi</textPath></text>
        <text className="map-district" x="132" y="118">BA ĐÌNH</text>
        <text className="map-district" x="300" y="166">HOÀN KIẾM</text>
        <text className="map-district" x="214" y="214">THANH XUÂN</text>
        <text className="map-district" x="300" y="296">HOÀNG MAI</text>
        <text className="map-district" x="78" y="356">HÀ ĐÔNG</text>
        <g className="map-compass" transform="translate(34 40)">
          <circle r="13" />
          <path className="map-compass-star" d="M0 -16 L3 -3 L16 0 L3 3 L0 16 L-3 3 L-16 0 L-3 -3 Z" />
          <path className="map-compass-north" d="M0 -16 L3 -3 L-3 -3 Z" />
          <text x="0" y="-20" textAnchor="middle">B</text>
        </g>
        <path className="map-leaf" d="M20 128 C14 136 18 148 28 150 C32 140 30 130 20 128 Z M28 150 L32 156" />
        <path className="map-leaf" d="M384 330 C376 332 372 344 378 350 C388 346 390 336 384 330 Z M378 350 L374 356" />
      </g>
      {/* The postmark, in red ink, struck a little crooked. */}
      <g className="map-postmark" transform="rotate(-14 366 46)">
        <circle cx="366" cy="46" r="24" />
        <circle cx="366" cy="46" r="13" />
        <text><textPath href={`#${id("ring")}`}>{copy.stamp}</textPath></text>
        <path className="map-postmark-heart" d="M366 51 C360 47 359 43.5 361 41.5 C363 39.5 365.3 40.3 366 42.2 C366.7 40.3 369 39.5 371 41.5 C373 43.5 372 47 366 51 Z" />
        <path className="map-postmark-wave" d="M290 34 C296 30 302 38 308 34 C314 30 320 38 326 34 C332 30 336 36 340 34 M290 46 C296 42 302 50 308 46 C314 42 320 50 326 46 C332 42 336 48 340 46 M290 58 C296 54 302 62 308 58 C314 54 320 62 326 58 C332 54 336 60 340 58" />
      </g>
    </>
  );
}

interface AutumnMapPocketProps {
  items: readonly StoryScrollItem[];
  activeId: string;
  visitedStoryIds?: ReadonlySet<string>;
  /** The part's chapters: the map's pocket only shows while they are on screen. */
  sectionRef: RefObject<HTMLElement | null>;
}

/**
 * The autumn's map, folded into a pocket at the corner of the screen while Part III is read. Opened, it is Hà Nội
 * drawn by hand with the thirteen places of the part on it, and a red thread that has reached as far as the reader
 * has: each new length draws itself the next time the map is opened, and a needle waits at its end, pointed at the
 * next place. A pin brings up its place's card, which goes back to the stop that tells it; so does the list beside it.
 */
export function AutumnMapPocket({ items, activeId, visitedStoryIds, sectionRef }: AutumnMapPocketProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  // How much thread the map showed when it was last closed, and how much it shows now.
  const [shown, setShown] = useState(0);
  const [drawn, setDrawn] = useState(0);
  // The place whose card is up: the one picked on the map, else the one the reader is at.
  const [picked, setPicked] = useState<string | null>(null);
  const onScreen = useOnScreen(sectionRef, "0px");
  const tucked = useTuckOnScrollDown();

  const order = useMemo(() => new Map(items.map((item, index) => [item.id, index])), [items]);
  const furthest = Math.max(order.get(activeId) ?? 0, ...[...(visitedStoryIds ?? [])].map((id) => order.get(id) ?? 0));
  const reached = autumnMapPlaces.filter((place) => (order.get(place.stopId) ?? Infinity) <= furthest).length;
  const tied = furthest >= items.length - 1;
  // Lengths of thread: one between each two places reached, and the last one to the knot once the birthday is read.
  const lengths = Math.max(0, reached - 1) + (tied ? 1 : 0);
  const here = autumnMapPlaces.find((place) => place.stopId === activeId) ?? autumnMapPlaces[Math.max(0, reached - 1)];
  const card = autumnMapPlaces.find((place) => place.name === picked) ?? here;
  // Each place carries its stop's icon, as on the route.
  const stateOf = (place: AutumnMapPlace) => items.find((item) => item.id === place.stopId)?.threadState as keyof typeof routeIcons | undefined;

  // The needle waits at the end of the thread, pointed at where it goes next.
  const tip = autumnMapPlaces[Math.max(0, reached - 1)];
  const next = reached < autumnMapPlaces.length ? autumnMapPlaces[reached] : KNOT;
  const gap = Math.hypot(next.x - tip.x, next.y - tip.y);
  // The eye a third of the way there, the thread running back from it to the last pin.
  const needle = tied ? null : { x: tip.x, y: tip.y, angle: (Math.atan2(next.y - tip.y, next.x - tip.x) * 180) / Math.PI, eye: Math.max(16, gap * 0.32) };
  const newLengths = Math.max(0, lengths - shown);
  const stitchTime = Math.min(0.42, 2.6 / Math.max(1, newLengths));

  // Once open, the new lengths draw themselves one after another, from where the thread stood when it was last seen.
  useEffect(() => {
    if (!open) return undefined;
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => setDrawn(lengths));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [lengths, open]);

  const show = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    setDrawn(shown);
    setPicked(null);
    setOpen(true);
    holdStoryScroll(true);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };
  // The dialog closes by its button, by Escape or by a tap outside the sheet; every way ends here.
  const onClose = () => {
    holdStoryScroll(false);
    setShown(lengths);
    setOpen(false);
  };
  const hide = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.close === "function") {
      dialog.close();
      return;
    }
    // Without a native dialog there is no close event to wait for.
    dialog.removeAttribute("open");
    onClose();
  };
  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) hide();
  };
  const goTo = (stopId: string) => {
    hide();
    holdStoryScroll(false);
    window.requestAnimationFrame(() => jumpToStoryTarget(stopId));
  };

  const pocket = (
    <button
      className={`map-pocket ${onScreen ? "is-on" : ""} ${tucked ? "is-tucked" : ""}`.replace(/\s+/g, " ").trim()}
      type="button"
      aria-haspopup="dialog"
      aria-label={`${copy.open}: ${reached}/${autumnMapPlaces.length} ${copy.places}`}
      onClick={show}
      tabIndex={onScreen ? 0 : -1}
    >
      {/* A map folded in three, the red thread across it and a pin at its end. */}
      <svg className="map-pocket-fold" viewBox="0 0 30 26" aria-hidden="true">
        <path className="fold-a" d="M2 4 L10 1 V22 L2 25 Z" />
        <path className="fold-b" d="M10 1 L20 4 V25 L10 22 Z" />
        <path className="fold-c" d="M20 4 L28 1 V22 L20 25 Z" />
        <path className="fold-thread" d="M5 19 C9 15 12 18 15 13 C18 8 21 12 24 8" />
        <circle className="fold-pin" cx="24" cy="7.5" r="2.6" />
      </svg>
      <span className="map-pocket-text" aria-hidden="true">
        <strong>{copy.open}</strong>
        <small>{String(reached).padStart(2, "0")}/{autumnMapPlaces.length}<span> {copy.places}</span></small>
      </span>
      {reached > 1 ? <i className="map-pocket-ping" key={reached} aria-hidden="true" /> : null}
    </button>
  );

  const cardState = stateOf(card);
  const CardIcon = cardState ? routeIcons[cardState] : undefined;
  const cardIndex = autumnMapPlaces.indexOf(card);
  const sheet = (
    <div className="autumn-map-sheet">
      <header className="autumn-map-header">
        <p className="autumn-map-eyebrow">{copy.eyebrow}</p>
        <h2 id="autumn-map-title">{copy.title}</h2>
        <button className="autumn-map-close" type="button" aria-label={copy.close} onClick={hide}>
          <X aria-hidden="true" size={20} />
        </button>
      </header>
      <p className="autumn-map-lead">{copy.lead}</p>
      <div className="autumn-map-body">
        <figure className="autumn-map-figure">
          <div className="autumn-map-paper">
            <i className="map-tape is-left" aria-hidden="true" />
            <i className="map-tape is-right" aria-hidden="true" />
            {/* A long way to catch up draws faster, so the thread never keeps the reader waiting more than a few seconds;
                the needle and the knot wait for it. */}
            <svg viewBox="0 0 400 360" aria-hidden="true" style={{ "--stitch": `${stitchTime.toFixed(3)}s`, "--thread-done": `${(newLengths * stitchTime + 0.3).toFixed(2)}s` } as CSSProperties}>
              <MapArt />
              {stitches.map((d, index) => (
                <g className={`map-stitch ${index < drawn ? "is-drawn" : ""}`} key={d} style={{ "--seq": Math.max(0, index - shown) } as CSSProperties}>
                  <path className="map-thread-shadow" d={d} pathLength={1} />
                  <path className="map-thread" d={d} pathLength={1} />
                  <path className="map-thread-twist" d={d} />
                </g>
              ))}
              {needle ? (
                <g className={`map-needle ${drawn >= lengths ? "is-ready" : ""}`} transform={`translate(${needle.x} ${needle.y}) rotate(${needle.angle.toFixed(1)})`}>
                  <path className="map-needle-thread" d={`M0 0 C${(needle.eye * 0.3).toFixed(1)} -5 ${(needle.eye * 0.62).toFixed(1)} 4 ${needle.eye.toFixed(1)} 0`} />
                  <path className="map-needle-steel" d={`M${(needle.eye - 3.5).toFixed(1)} -1.5 C${(needle.eye + 6).toFixed(1)} -1.3 ${(needle.eye + 20).toFixed(1)} -0.6 ${(needle.eye + 30).toFixed(1)} 0 C${(needle.eye + 20).toFixed(1)} 0.6 ${(needle.eye + 6).toFixed(1)} 1.3 ${(needle.eye - 3.5).toFixed(1)} 1.5 Z`} />
                  <ellipse className="map-needle-eye" cx={needle.eye.toFixed(1)} cy="0" rx="2.2" ry="0.6" />
                </g>
              ) : null}
              <path
                className={`map-knot ${tied && drawn >= lengths ? "is-tied" : ""}`}
                d={`M${KNOT.x} ${KNOT.y + 9} C${KNOT.x - 13} ${KNOT.y} ${KNOT.x - 9} ${KNOT.y - 11} ${KNOT.x} ${KNOT.y - 5} C${KNOT.x + 9} ${KNOT.y - 11} ${KNOT.x + 13} ${KNOT.y} ${KNOT.x} ${KNOT.y + 9} Z`}
              />
            </svg>
            {/* The pins answer a pointer; the list beside the map is the same thirteen places for keyboards and readers. */}
            <ol className="autumn-map-pins" aria-hidden="true">
              {autumnMapPlaces.map((place, index) => {
                const isReached = index < reached;
                const isHere = place.stopId === activeId;
                const isPicked = place === card;
                return (
                  <li
                    key={place.name}
                    className={`${isReached ? "is-reached" : ""} ${isHere ? "is-here" : ""} ${isPicked ? "is-picked" : ""}`.replace(/\s+/g, " ").trim() || undefined}
                    style={{ left: `${place.x / 4}%`, top: `${place.y / 3.6}%` } as CSSProperties}
                    onClick={() => setPicked(place.name)}
                  >
                    <b>{index + 1}</b>
                    <span>{place.name}</span>
                  </li>
                );
              })}
              {tied ? <li className="is-knot" style={{ left: `${KNOT.x / 4}%`, top: `${KNOT.y / 3.6}%` }}><span>{copy.end}</span></li> : null}
            </ol>
          </div>
          {/* The card of the place in hand, and the way back to it. */}
          <figcaption className={`map-card ${cardIndex < reached ? "is-reached" : ""}`.trim()} key={card.name} aria-hidden="true">
            <b>{String(cardIndex + 1).padStart(2, "0")}</b>
            <div>
              <strong>{CardIcon ? <CardIcon size={14} strokeWidth={2.2} /> : null}{card.name}</strong>
              <small>{card.date} · {cardIndex < reached ? card.note : copy.ahead}</small>
            </div>
            <button type="button" tabIndex={-1} onClick={() => goTo(card.stopId)}>
              {copy.go}
              <ArrowRight size={14} />
            </button>
          </figcaption>
        </figure>
        <ol className="autumn-map-list">
          {autumnMapPlaces.map((place, index) => {
            const isReached = index < reached;
            const isHere = place.stopId === activeId;
            const state = stateOf(place);
            const Icon = state ? routeIcons[state] : undefined;
            return (
              <li key={place.name} className={`${isReached ? "is-reached" : ""} ${isHere ? "is-here" : ""}`.trim() || undefined}>
                <button type="button" onClick={() => goTo(place.stopId)} aria-current={isHere ? "location" : undefined}>
                  <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
                  <span>
                    <strong>{place.name}</strong>
                    <small>{place.date} · {isReached ? place.note : copy.ahead}</small>
                  </span>
                  {Icon ? <Icon className="autumn-map-list-icon" aria-hidden="true" size={15} strokeWidth={2} /> : null}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="autumn-map-note">{copy.note}</p>
    </div>
  );

  return createPortal(
    <>
      {pocket}
      <dialog className="autumn-map" ref={dialogRef} aria-labelledby="autumn-map-title" data-lenis-prevent onClose={onClose} onClick={onBackdrop}>
        {open ? sheet : null}
      </dialog>
    </>,
    document.body,
  );
}
