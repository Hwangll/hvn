import { ArrowLeft, ArrowRight, BookOpen, HeartHandshake, MoveHorizontal } from "lucide-react";
import { Fragment, lazy, Suspense, type CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import Tilt from "react-parallax-tilt";
import { IntroFlowerFallback } from "../../memories/components/IntroFlowerFallback";
import { createStoryScrollItems, storyParts } from "../../story/data/story";
import { usePointerParallax } from "../../../shared/hooks/usePointerParallax";
import type { ExperienceState } from "../../../app/AppShell";

const MemoryFlower3D = lazy(() =>
  import("../../memories/components/MemoryFlower3D").then((module) => ({ default: module.MemoryFlower3D })),
);

interface MemoryIntroProps {
  onEnterStory: () => void;
  phase: ExperienceState;
  reducedMotion: boolean;
}

type PartIndex = 0 | 1;

const dustParticles = Array.from({ length: 22 }, (_, index) => ({
  id: `memory-dust-${index}`,
  left: `${6 + ((index * 17) % 88)}%`,
  top: `${8 + ((index * 23) % 80)}%`,
  delay: `${(index % 7) * 0.9}s`,
  duration: `${6 + (index % 5) * 1.3}s`,
  size: `${2 + (index % 3)}px`,
}));

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
};

const PART_TWO_URL = "/part-2/";

export function MemoryIntro({ onEnterStory, phase, reducedMotion }: MemoryIntroProps) {
  const [activePart, setActivePart] = useState<PartIndex>(0);
  const [leaving, setLeaving] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const isFocusing = phase === "focusing" || phase === "transitioning";
  usePointerParallax(stageRef, !reducedMotion && !isFocusing);

  // Part II lives on its own page; a short blue bloom covers the hop so it lands on the same dark ground.
  const leaveToPartTwo = useCallback(() => {
    if (leaving) return;
    if (reducedMotion) {
      window.location.assign(PART_TWO_URL);
      return;
    }
    setLeaving(true);
    window.setTimeout(() => window.location.assign(PART_TWO_URL), 780);
  }, [leaving, reducedMotion]);

  const className = [
    "memory-intro",
    activePart === 1 ? "is-part-two-selected" : "is-part-one-selected",
    isFocusing ? "is-focusing" : "",
    leaving ? "is-leaving" : "",
  ].join(" ");

  return (
    <section className={className} aria-labelledby="memory-title" data-lenis-prevent>
      <div className="memory-atmosphere" aria-hidden="true">
        <span className="memory-sky memory-sky-one">
          <i className="star-layer star-layer-far" />
          <i className="aurora memory-aurora memory-aurora-a" />
          <i className="aurora memory-aurora memory-aurora-b" />
        </span>
        <span className="memory-sky memory-sky-two">
          <i className="star-layer star-layer-far" />
          <i className="star-layer star-layer-near" />
          <i className="aurora memory-aurora memory-aurora-a" />
          <i className="aurora memory-aurora memory-aurora-b" />
        </span>
        <span className="memory-spotlight" />
        <span className="memory-floor-glow" />
        <span className="memory-vignette" />
        {dustParticles.map((particle) => (
          <span
            className="memory-dust"
            key={particle.id}
            style={{ "--dust-left": particle.left, "--dust-top": particle.top, "--dust-delay": particle.delay, "--dust-duration": particle.duration, "--dust-size": particle.size } as CSSProperties}
          />
        ))}
      </div>

      <header className="memory-masthead">
        <a className="memory-wordmark" href="/" aria-label="Hát và Nờ — trang mở đầu">Hát <i>&</i> Nờ<span>MỘT CÂU CHUYỆN CỦA CHÚNG MÌNH</span></a>
        <span className="memory-edition"><i /> Bộ sưu tập những ngày thương</span>
      </header>

      <div className="memory-intro-stage" ref={stageRef}>
        <HeroCopy activePart={activePart} />
        <MemoryArtifact activePart={activePart} onEnterStory={onEnterStory} onEnterPartTwo={leaveToPartTwo} reducedMotion={reducedMotion} />
        <MemoryCallToAction activePart={activePart} onPartChange={setActivePart} onEnterStory={onEnterStory} onEnterPartTwo={leaveToPartTwo} reducedMotion={reducedMotion} />
      </div>
      <footer className="memory-room-footer">
        <span>Hai người. Hai phần. Một câu chuyện.</span>
        <span>Được giữ lại bằng tất cả dịu dàng <span aria-hidden="true">↗</span></span>
      </footer>
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
            </span>
          </Fragment>
        ))}
      </h1>
      <p className="memory-lead">{copy.lead}</p>
    </div>
  );
}

function MemoryArtifact({ activePart, onEnterStory, onEnterPartTwo, reducedMotion }: Pick<MemoryIntroProps, "onEnterStory" | "reducedMotion"> & { activePart: PartIndex; onEnterPartTwo: () => void }) {
  const variant = activePart === 1 ? "hydrangea" : "sunflower";

  return (
    <button
      className="memory-artifact"
      type="button"
      onClick={activePart === 1 ? onEnterPartTwo : onEnterStory}
      aria-label={activePart === 1 ? "Chạm vào cẩm tú cầu để mở Phần II" : "Chạm vào bó hoa để mở câu chuyện"}
    >
      <span className="memory-light-cone" aria-hidden="true" />
      <span className="memory-halo" aria-hidden="true" />
      <Tilt
        tiltEnable={!reducedMotion}
        tiltMaxAngleX={4}
        tiltMaxAngleY={6}
        glareEnable={false}
        perspective={1400}
        scale={1.015}
        transitionSpeed={1100}
      >
        <span className="memory-bouquet-frame">
          <Suspense fallback={<span className="memory-flower-3d is-fallback"><IntroFlowerFallback variant={variant} /></span>}>
            <MemoryFlower3D variant={variant} reducedMotion={reducedMotion} />
          </Suspense>
        </span>
      </Tilt>
      <span className="memory-plinth" aria-hidden="true">
        <span className="memory-plinth-disc" />
        <span className="memory-plinth-label" key={activePart}>
          <strong>{activePart === 1 ? "LOT 02" : "LOT 01"}</strong>
          <span>{activePart === 1 ? "CẨM TÚ CẦU · PHẦN II" : "HƯỚNG DƯƠNG · 2023-2026"}</span>
          <span>Giá trị không thể quy đổi</span>
        </span>
      </span>
      <span className="memory-artifact-hint">Chạm vào hoa, mở một miền ký ức <ArrowRight aria-hidden="true" size={14} /></span>
    </button>
  );
}

function MemoryCallToAction({ activePart, onPartChange, onEnterStory, onEnterPartTwo, reducedMotion }: Pick<MemoryIntroProps, "onEnterStory" | "reducedMotion"> & {
  activePart: PartIndex;
  onPartChange: (part: PartIndex) => void;
  onEnterPartTwo: () => void;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const stops = useMemo(
    () => storyParts.map((part) => createStoryScrollItems([part]).map((item) => item.shortTitle)),
    [],
  );

  const showPart = (index: number) => {
    const nextPart: PartIndex = index <= 0 ? 0 : 1;
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
          <strong>0{activePart + 1} / 02</strong>
        </div>

        <div
          className="memory-picker-viewport"
          ref={pickerRef}
          onScroll={(event) => {
            const viewport = event.currentTarget;
            if (viewport.clientWidth > 0) {
              onPartChange(viewport.scrollLeft / viewport.clientWidth >= 0.5 ? 1 : 0);
            }
          }}
        >
          <div className="memory-picker-track">
            <article className={`memory-part-card memory-part-card-one ${activePart === 0 ? "is-active" : ""}`}>
              <span className="memory-part-numeral" aria-hidden="true">I</span>
              <span className="memory-part-number">PHẦN I</span>
              <BookOpen aria-hidden="true" size={20} />
              <div>
                <strong>Trước khi gặp nhau</strong>
                <small>Những lần gặp, bỏ lỡ và tìm thấy nhau.</small>
              </div>
              <ol className="memory-part-stops" aria-hidden="true">
                {stops[0].map((stop, index) => <li key={stop} style={{ "--i": index } as CSSProperties}>{stop}</li>)}
              </ol>
              <button className="memory-primary-cta" type="button" onClick={onEnterStory}>
                Khám phá câu chuyện
                <ArrowRight aria-hidden="true" size={17} />
              </button>
            </article>

            <article className={`memory-part-card memory-part-card-two ${activePart === 1 ? "is-active" : ""}`}>
              <span className="memory-part-numeral" aria-hidden="true">II</span>
              <span className="memory-part-number">PHẦN II</span>
              <HeartHandshake aria-hidden="true" size={20} />
              <div>
                <strong>Thật sự đứng cạnh nhau</strong>
                <small>Những buổi gặp, cuộc hẹn và một ngày thật chậm.</small>
              </div>
              <ol className="memory-part-stops" aria-hidden="true">
                {stops[1].map((stop, index) => <li key={stop} style={{ "--i": index } as CSSProperties}>{stop}</li>)}
              </ol>
              <a
                className="memory-secondary-cta"
                href={PART_TWO_URL}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                  event.preventDefault();
                  onEnterPartTwo();
                }}
              >
                Đi thẳng tới Phần II
                <ArrowRight aria-hidden="true" size={17} />
              </a>
            </article>
          </div>
        </div>

        <div className="memory-picker-controls">
          <button type="button" aria-label="Xem phần trước" disabled={activePart === 0} onClick={() => showPart(activePart - 1)}>
            <ArrowLeft aria-hidden="true" size={15} />
          </button>
          <div className="memory-picker-dots" aria-hidden="true">
            <span className={activePart === 0 ? "is-active" : ""} />
            <span className={activePart === 1 ? "is-active" : ""} />
          </div>
          <button type="button" aria-label="Xem phần tiếp theo" disabled={activePart === 1} onClick={() => showPart(activePart + 1)}>
            <ArrowRight aria-hidden="true" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
