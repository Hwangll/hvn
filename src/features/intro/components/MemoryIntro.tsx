import { ArrowLeft, ArrowRight, BookOpen, HeartHandshake, MoveHorizontal, Sparkles } from "lucide-react";
import { lazy, Suspense, type CSSProperties, useRef, useState } from "react";
import Tilt from "react-parallax-tilt";
import { IntroFlowerFallback } from "../../memories/components/IntroFlowerFallback";
import type { ExperienceState } from "../../../app/AppShell";

const MemoryFlower3D = lazy(() =>
  import("../../memories/components/MemoryFlower3D").then((module) => ({ default: module.MemoryFlower3D })),
);

interface MemoryIntroProps {
  onEnterStory: () => void;
  phase: ExperienceState;
  reducedMotion: boolean;
}

const dustParticles = Array.from({ length: 18 }, (_, index) => ({
  id: `memory-dust-${index}`,
  left: `${8 + ((index * 17) % 84)}%`,
  top: `${10 + ((index * 23) % 76)}%`,
  delay: `${(index % 6) * 0.7}s`,
}));

export function MemoryIntro({ onEnterStory, phase, reducedMotion }: MemoryIntroProps) {
  const [activePart, setActivePart] = useState<0 | 1>(0);
  const isFocusing = phase === "focusing" || phase === "transitioning";

  return (
    <section className={`memory-intro ${isFocusing ? "is-focusing" : ""} ${activePart === 1 ? "is-part-two-selected" : ""}`} aria-labelledby="memory-title">
      <div className="memory-atmosphere" aria-hidden="true">
        <span className="memory-room-haze" />
        <span className="memory-room-wall" />
        <span className="memory-room-floor" />
        <span className="memory-room-depth memory-room-depth-left" />
        <span className="memory-room-depth memory-room-depth-right" />
        <span className="memory-spotlight" />
        <span className="memory-floor-glow" />
        {dustParticles.map((particle) => (
          <span
            className="memory-dust"
            key={particle.id}
            style={{ "--dust-left": particle.left, "--dust-top": particle.top, "--dust-delay": particle.delay } as CSSProperties}
          />
        ))}
      </div>

      <div className="memory-intro-stage">
        <HeroCopy activePart={activePart} />
        <MemoryArtifact activePart={activePart} onEnterStory={onEnterStory} reducedMotion={reducedMotion} />
        <MemoryCallToAction activePart={activePart} onPartChange={setActivePart} onEnterStory={onEnterStory} reducedMotion={reducedMotion} />
      </div>
    </section>
  );
}

function HeroCopy({ activePart }: { activePart: 0 | 1 }) {
  if (activePart === 1) return (
    <div className="memory-copy" aria-live="polite">
      <p className="memory-kicker">LOT 02 · CẨM TÚ CẦU</p>
      <h1 id="memory-title">Sắc xanh của những ngày có nhau</h1>
      <p>Một bó cẩm tú cầu xanh, cho phần câu chuyện khi hai người thật sự đứng cạnh nhau.</p>
    </div>
  );
  return (
    <div className="memory-copy">
      <p className="memory-kicker">LOT 01</p>
      <h1 id="memory-title" aria-label="Hoa của một lần gặp gỡ">
        <span aria-hidden="true">Hoa của một lần</span>
        <span aria-hidden="true">gặp gỡ</span>
      </h1>
      <p>Một bó hoa đã đi qua những lần gặp, bỏ lỡ và tìm thấy nhau.</p>
    </div>
  );
}

function MemoryArtifact({ activePart, onEnterStory, reducedMotion }: Pick<MemoryIntroProps, "onEnterStory" | "reducedMotion"> & { activePart: 0 | 1 }) {
  const variant = activePart === 1 ? "hydrangea" : "sunflower";
  const contents = (
    <>
      <Tilt
        tiltEnable={!reducedMotion}
        tiltMaxAngleX={3.5}
        tiltMaxAngleY={5}
        glareEnable={!reducedMotion}
        glareMaxOpacity={0.08}
        glareColor="#fff8ed"
        glareBorderRadius="2.4rem"
        perspective={1400}
        scale={1.012}
        transitionSpeed={1100}
      >
        <span className="memory-bouquet-frame">
          <span className="memory-case memory-case-back" aria-hidden="true" />
          <span className="memory-case memory-case-left" aria-hidden="true" />
          <span className="memory-case memory-case-right" aria-hidden="true" />
          <span className="memory-case memory-case-top" aria-hidden="true" />
          <Suspense fallback={<span className="memory-flower-3d is-fallback"><IntroFlowerFallback variant={variant} /></span>}>
            <MemoryFlower3D variant={variant} reducedMotion={reducedMotion} />
          </Suspense>
          <span className="memory-case memory-case-front" aria-hidden="true" />
          <span className="memory-case memory-case-glint" aria-hidden="true" />
        </span>
      </Tilt>
      <span className="memory-plinth" aria-hidden="true">
        <span className="memory-plinth-shine" />
        <span className="memory-plinth-label">
          <strong>{activePart === 1 ? "LOT 02" : "LOT 01"}</strong>
          <span>{activePart === 1 ? "CẨM TÚ CẦU · PHẦN II" : "2023-2026"}</span>
          <span>Giá trị không thể quy đổi</span>
        </span>
      </span>
    </>
  );
  return (
    <button
      className="memory-artifact"
      type="button"
      onClick={activePart === 1 ? () => window.location.assign("/part-2/") : onEnterStory}
      aria-label={activePart === 1 ? "Chạm vào cẩm tú cầu để mở Phần II" : "Chạm vào bó hoa để mở câu chuyện"}
    >{contents}</button>
  );
}

function MemoryCallToAction({ activePart, onPartChange, onEnterStory, reducedMotion }: Pick<MemoryIntroProps, "onEnterStory" | "reducedMotion"> & {
  activePart: 0 | 1;
  onPartChange: (part: 0 | 1) => void;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const showPart = (index: number) => {
    const nextPart = index <= 0 ? 0 : 1;
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
        <Sparkles aria-hidden="true" size={15} />
        Giá trị không thể quy đổi
      </div>
      <div className="memory-part-picker" role="region" aria-label="Chọn phần câu chuyện">
        <div className="memory-picker-heading">
          <span><MoveHorizontal aria-hidden="true" size={15} /> Vuốt để đổi phần</span>
          <strong>{activePart + 1} / 2</strong>
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
            <article className="memory-part-card memory-part-card-one">
              <span className="memory-part-number">PHẦN I</span>
              <BookOpen aria-hidden="true" size={22} />
              <div>
                <strong>Trước khi gặp nhau</strong>
                <small>Những lần gặp, bỏ lỡ và tìm thấy nhau.</small>
              </div>
              <button className="memory-primary-cta" type="button" onClick={onEnterStory}>
                Khám phá câu chuyện
                <ArrowRight aria-hidden="true" size={17} />
              </button>
            </article>

            <article className="memory-part-card memory-part-card-two">
              <span className="memory-part-number">PHẦN II</span>
              <HeartHandshake aria-hidden="true" size={22} />
              <div>
                <strong>Thật sự đứng cạnh nhau</strong>
                <small>Những buổi gặp, cuộc hẹn và một ngày thật chậm.</small>
              </div>
              <a className="memory-secondary-cta" href="/part-2/">
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
