import { ArrowRight, Sparkles } from "lucide-react";
import { lazy, Suspense, type CSSProperties } from "react";
import Tilt from "react-parallax-tilt";
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
  const isFocusing = phase === "focusing" || phase === "transitioning";

  return (
    <section className={`memory-intro ${isFocusing ? "is-focusing" : ""}`} aria-labelledby="memory-title">
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
        <HeroCopy />
        <MemoryArtifact onEnterStory={onEnterStory} reducedMotion={reducedMotion} />
        <MemoryCallToAction onEnterStory={onEnterStory} />
      </div>
    </section>
  );
}

function HeroCopy() {
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

function MemoryArtifact({ onEnterStory, reducedMotion }: Pick<MemoryIntroProps, "onEnterStory" | "reducedMotion">) {
  return (
    <button className="memory-artifact" type="button" onClick={onEnterStory} aria-label="Chạm vào bó hoa để mở câu chuyện">
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
          <Suspense fallback={<span className="memory-flower-3d is-fallback"><span className="memory-flower-fallback" /></span>}>
            <MemoryFlower3D reducedMotion={reducedMotion} />
          </Suspense>
          <span className="memory-case memory-case-front" aria-hidden="true" />
          <span className="memory-case memory-case-glint" aria-hidden="true" />
        </span>
      </Tilt>
      <span className="memory-plinth" aria-hidden="true">
        <span className="memory-plinth-shine" />
        <span className="memory-plinth-label">
          <strong>LOT 01</strong>
          <span>2023-2026</span>
          <span>Giá trị không thể quy đổi</span>
        </span>
      </span>
    </button>
  );
}

function MemoryCallToAction({ onEnterStory }: Pick<MemoryIntroProps, "onEnterStory">) {
  return (
    <div className="memory-cta-panel">
      <div className="memory-status">
        <Sparkles aria-hidden="true" size={15} />
        Giá trị không thể quy đổi
      </div>
      <button className="memory-primary-cta" type="button" onClick={onEnterStory}>
        Khám phá câu chuyện
        <ArrowRight aria-hidden="true" size={17} />
      </button>
      <p>Chạm vào bó hoa để mở lại những ký ức bên trong.</p>
    </div>
  );
}
