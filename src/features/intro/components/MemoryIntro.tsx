import { ArrowLeft, ArrowRight, BookOpen, Flame, HeartHandshake, MoveHorizontal, type LucideIcon } from "lucide-react";
import { Fragment, lazy, Suspense, type CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import { BouquetLoader } from "../../memories/components/BouquetLoader";
import type { IntroFlowerVariant } from "../../memories/model/introFlowers";
import { Meteors } from "../../../shared/components/motion/Meteors";
import { createStoryScrollItems, partHrefs, storyParts } from "../../story/data/story";
import { usePointerParallax } from "../../../shared/hooks/usePointerParallax";
import type { ExperienceState } from "../../../app/AppShell";
import { useRealmAnchor } from "../hooks/useRealmAnchor";
import type { FairyVariant } from "../utils/fairyDust";
import { FairyDust } from "./FairyDust";
import { FairyRealm } from "./FairyRealm";

const MemoryFlower3D = lazy(() =>
  import("../../memories/components/MemoryFlower3D").then((module) => ({ default: module.MemoryFlower3D })),
);

interface MemoryIntroProps {
  onEnterStory: () => void;
  phase: ExperienceState;
  reducedMotion: boolean;
}

type PartIndex = 0 | 1 | 2;

const PARTS: PartIndex[] = [0, 1, 2];
/** The nearest part to a position along the picker, in cards. */
const partAt = (position: number): PartIndex => PARTS[Math.min(PARTS.length - 1, Math.max(0, Math.round(position)))];
/** Each part's name in the room's classes: `is-part-two-selected`, `memory-part-card-two`. */
const partNames: Record<PartIndex, string> = { 0: "one", 1: "two", 2: "three" };
/** Phần I opens in this page; the others live on pages of their own. */
const partHref = (part: PartIndex) => partHrefs[storyParts[part].id];

/** The words of each keepsake title, with the italic accent marked so they can rise one after another. */
const heroCopy: Record<PartIndex, { kicker: string; title: string; accentFrom: number; accentTo: number; breakBefore?: number; lead: string }> = {
  0: {
    kicker: "KỶ VẬT 01 / HƯỚNG DƯƠNG",
    title: "Hoa của một lần gặp gỡ",
    accentFrom: 4,
    accentTo: 6,
    breakBefore: 4,
    lead: "Một bó hoa đã đi qua những lần gặp, bỏ lỡ và tìm thấy nhau.",
  },
  1: {
    kicker: "KỶ VẬT 02 / CẨM TÚ CẦU",
    title: "Sắc xanh của những ngày có nhau",
    accentFrom: 0,
    accentTo: 2,
    breakBefore: 2,
    lead: "Một bó cẩm tú cầu xanh, cho phần câu chuyện khi hai người thật sự đứng cạnh nhau.",
  },
  2: {
    kicker: "KỶ VẬT 03 / HOA LY ĐỎ",
    // "lần đầu" holds together, so the last line never ends on one short word.
    title: "Sắc đỏ của những lần đầu",
    accentFrom: 0,
    accentTo: 2,
    breakBefore: 2,
    lead: "Một bó ly đỏ, cho mùa thu yêu quá nhanh, quá nguy hiểm, và toàn là những lần đầu với nhau.",
  },
};

/** Each part's keepsake in the cabinet, the realm it stands in above the clouds, and its plinth's label. */
const keepsakes: Record<PartIndex, { flower: IntroFlowerVariant; realm: FairyVariant; lot: string; label: string; touch: string }> = {
  0: { flower: "sunflower", realm: "dusk", lot: "LOT 01", label: "HƯỚNG DƯƠNG · 2023-2026", touch: "Chạm vào bó hoa để mở câu chuyện" },
  1: { flower: "hydrangea", realm: "night", lot: "LOT 02", label: "CẨM TÚ CẦU · PHẦN II", touch: "Chạm vào cẩm tú cầu để mở Phần II" },
  2: { flower: "lily", realm: "ember", lot: "LOT 03", label: "HOA LY ĐỎ · PHẦN III", touch: "Chạm vào hoa ly để mở Phần III" },
};

/** The picker's cards, one per part. */
const partCards: Record<PartIndex, { numeral: string; Icon: LucideIcon; title: string; note: string; action: string }> = {
  0: { numeral: "I", Icon: BookOpen, title: "Trước khi gặp nhau", note: "Những lần gặp, bỏ lỡ và tìm thấy nhau.", action: "Khám phá câu chuyện" },
  1: { numeral: "II", Icon: HeartHandshake, title: "Thật sự đứng cạnh nhau", note: "Những buổi gặp, cuộc hẹn và một ngày thật chậm.", action: "Đi thẳng tới Phần II" },
  2: { numeral: "III", Icon: Flame, title: "Quá nhanh, quá nguy hiểm", note: "Một mùa thu toàn những lần đầu với nhau.", action: "Đi thẳng tới Phần III" },
};

/** A part with a handful of stops lists every one; a longer part lists its chapters instead. */
const MAX_LISTED_STOPS = 8;
const partStops = storyParts.map((part) => {
  const items = createStoryScrollItems([part]);
  return items.length <= MAX_LISTED_STOPS ? items.map((item) => item.shortTitle) : part.chapters.map((chapter) => chapter.shortTitle);
});

export function MemoryIntro({ onEnterStory, phase, reducedMotion }: MemoryIntroProps) {
  const [activePart, setActivePart] = useState<PartIndex>(0);
  const [leaving, setLeaving] = useState(false);
  const roomRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const isFocusing = phase === "focusing" || phase === "transitioning";
  usePointerParallax(stageRef, !reducedMotion && !isFocusing);
  useRealmAnchor(roomRef);

  // Parts II and III live on pages of their own; a short bloom in the part's colour covers the hop so it lands on the
  // same dark ground.
  const leaveTo = useCallback((href: string) => {
    if (leaving) return;
    if (reducedMotion) {
      window.location.assign(href);
      return;
    }
    setLeaving(true);
    window.setTimeout(() => window.location.assign(href), 780);
  }, [leaving, reducedMotion]);

  const className = [
    "memory-intro",
    `is-part-${partNames[activePart]}-selected`,
    isFocusing ? "is-focusing" : "",
    leaving ? "is-leaving" : "",
  ].join(" ");

  return (
    <section className={className} aria-labelledby="memory-title" data-lenis-prevent ref={roomRef}>
      {/* A realm above the clouds for each part (FairyRealm), crossfaded by the part in hand. */}
      <div className="memory-atmosphere" aria-hidden="true">
        <FairyRealm />
        <Meteors className="memory-meteors" />
        <span className="memory-floor-glow" />
        <span className="memory-vignette" />
      </div>

      <header className="memory-masthead">
        <a className="memory-wordmark" href="/" aria-label="Hát và Nờ — trang mở đầu">Hát <i>&</i> Nờ<span>MỘT CÂU CHUYỆN CỦA CHÚNG MÌNH</span></a>
        <span className="memory-edition"><i /> Bộ sưu tập những ngày thương</span>
      </header>

      <div className="memory-intro-stage" ref={stageRef}>
        <HeroCopy activePart={activePart} />
        <MemoryArtifact activePart={activePart} onEnterStory={onEnterStory} onLeaveTo={leaveTo} reducedMotion={reducedMotion} />
        <MemoryCallToAction activePart={activePart} onPartChange={setActivePart} onEnterStory={onEnterStory} onLeaveTo={leaveTo} reducedMotion={reducedMotion} />
      </div>
      <footer className="memory-room-footer">
        <span>Hai người. Ba phần. Một câu chuyện.</span>
        <span>Được giữ lại bằng tất cả dịu dàng <span aria-hidden="true">↗</span></span>
      </footer>
      {reducedMotion ? null : <FairyDust variant={keepsakes[activePart].realm} gathering={isFocusing || leaving} rootRef={roomRef} />}
      <span className="memory-leave-veil" aria-hidden="true" />
    </section>
  );
}

function HeroCopy({ activePart }: { activePart: PartIndex }) {
  const copy = heroCopy[activePart];
  const words = useMemo(() => copy.title.split(" "), [copy.title]);

  return (
    // Remounting on part change replays the word-by-word rise.
    <div className="memory-copy" key={activePart} aria-live="polite">
      <p className="memory-kicker"><i aria-hidden="true" />{copy.kicker}</p>
      <h1 id="memory-title" aria-label={copy.title}>
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            {index > 0 && index === copy.breakBefore ? <br aria-hidden="true" /> : index > 0 ? " " : null}
            <span className={`memory-title-word ${index >= copy.accentFrom && index < copy.accentTo ? "is-accent" : ""}`} style={{ "--i": index } as CSSProperties} aria-hidden="true">
              <span>{word}</span>
              {/* A star caught on the last word in gold; kept outside the text-clipped span so twinkling never repaints the word. */}
              {index === copy.accentTo - 1 ? <i className="memory-title-star" /> : null}
            </span>
          </Fragment>
        ))}
      </h1>
      <p className="memory-lead">{copy.lead}</p>
    </div>
  );
}

function MemoryArtifact({ activePart, onEnterStory, onLeaveTo, reducedMotion }: Pick<MemoryIntroProps, "onEnterStory" | "reducedMotion"> & { activePart: PartIndex; onLeaveTo: (href: string) => void }) {
  const keepsake = keepsakes[activePart];

  return (
    <button
      className="memory-artifact"
      type="button"
      onClick={activePart === 0 ? onEnterStory : () => onLeaveTo(partHref(activePart))}
      aria-label={keepsake.touch}
    >
      <span className="memory-light-cone" aria-hidden="true" />
      <span className="memory-halo" aria-hidden="true" />
      {/* The bouquet turns in 3D on its own camera; tilting the canvas as a flat card would only make it read as a picture. */}
      <span className="memory-bouquet-frame">
        <span className="realm-ripples" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <Suspense fallback={<span className="memory-flower-3d"><BouquetLoader /></span>}>
          <MemoryFlower3D variant={keepsake.flower} reducedMotion={reducedMotion} />
        </Suspense>
      </span>
      <span className="memory-plinth" aria-hidden="true">
        <span className="memory-plinth-disc" />
        <span className="memory-plinth-label" key={activePart}>
          <strong>{keepsake.lot}</strong>
          <span>{keepsake.label}</span>
          <span>Giá trị không thể quy đổi</span>
        </span>
      </span>
      <span className="memory-artifact-hint">Chạm vào hoa, mở một miền ký ức <ArrowRight aria-hidden="true" size={14} /></span>
    </button>
  );
}

function MemoryCallToAction({ activePart, onPartChange, onEnterStory, onLeaveTo, reducedMotion }: Pick<MemoryIntroProps, "onEnterStory" | "reducedMotion"> & {
  activePart: PartIndex;
  onPartChange: (part: PartIndex) => void;
  onLeaveTo: (href: string) => void;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const showPart = (index: number) => {
    const nextPart = partAt(index);
    const viewport = pickerRef.current;
    if (!viewport?.clientWidth) {
      onPartChange(nextPart);
      return;
    }
    viewport?.scrollTo({
      behavior: reducedMotion ? "auto" : "smooth",
      left: nextPart * viewport.clientWidth,
    });
  };

  return (
    <div className="memory-cta-panel">
      <div className="memory-status">
        <span aria-hidden="true" />
        Mỗi kỷ vật, một chuyện để kể
      </div>
      <div className="memory-part-picker" role="region" aria-label="Chọn phần câu chuyện">
        <div className="memory-picker-heading">
          <span><MoveHorizontal aria-hidden="true" size={15} /> Vuốt để đổi phần</span>
          <strong>0{activePart + 1} / 0{PARTS.length}</strong>
        </div>

        <div
          className="memory-picker-viewport"
          ref={pickerRef}
          onScroll={(event) => {
            const viewport = event.currentTarget;
            if (viewport.clientWidth > 0) onPartChange(partAt(viewport.scrollLeft / viewport.clientWidth));
          }}
        >
          <div className="memory-picker-track">
            {PARTS.map((part) => {
              const { numeral, Icon, title, note, action } = partCards[part];
              return (
                <article className={`memory-part-card memory-part-card-${partNames[part]} ${activePart === part ? "is-active" : ""}`} data-spotlight key={part}>
                  <span className="memory-part-numeral" aria-hidden="true">{numeral}</span>
                  <span className="memory-part-number">PHẦN {numeral}</span>
                  <Icon aria-hidden="true" size={20} />
                  <div>
                    <strong>{title}</strong>
                    <small>{note}</small>
                  </div>
                  <ol className="memory-part-stops" aria-hidden="true">
                    {partStops[part].map((stop, index) => <li key={`${index}-${stop}`} style={{ "--i": index } as CSSProperties}>{stop}</li>)}
                  </ol>
                  {part === 0 ? (
                    <button className="memory-primary-cta has-shimmer" type="button" data-magnetic onClick={onEnterStory}>
                      {action}
                      <ArrowRight aria-hidden="true" size={17} />
                    </button>
                  ) : (
                    <a
                      className="memory-secondary-cta"
                      data-magnetic
                      href={partHref(part)}
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                        event.preventDefault();
                        onLeaveTo(partHref(part));
                      }}
                    >
                      {action}
                      <ArrowRight aria-hidden="true" size={17} />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <div className="memory-picker-controls">
          <button type="button" aria-label="Xem phần trước" disabled={activePart === 0} onClick={() => showPart(activePart - 1)}>
            <ArrowLeft aria-hidden="true" size={15} />
          </button>
          <div className="memory-picker-dots" aria-hidden="true">
            {PARTS.map((part) => <span className={activePart === part ? "is-active" : ""} key={part} />)}
          </div>
          <button type="button" aria-label="Xem phần tiếp theo" disabled={activePart === PARTS.length - 1} onClick={() => showPart(activePart + 1)}>
            <ArrowRight aria-hidden="true" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
