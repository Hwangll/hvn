import { memo, useRef } from "react";
import { usePointerGlow } from "../hooks/usePointerGlow";

interface PartThreeAtmosphereProps {
  reducedMotion?: boolean;
}

/**
 * The fixed sky behind Part III, one mood per stop, crossfaded by usePartTwoScroll exactly as Part II's are (it also
 * wears Part II's sky class, so it is fixed, grained and lit by the cursor the same way). It opens in the homestay's red
 * room, with a projector's beam crossing it; then the glow of two phones, a gold afternoon in Hoàng Mai, the clear
 * morning at Ba Đình, the jade of the lotus pond, and the noon rain giving way to dusk. Chapters 5 and 6 go on in red:
 * the karaoke's neon in the rain, the rose of the room at 59A, the lake's city lights, a gold afternoon at Tiny cf, the
 * yellow stage at Cúc cu, a lilac dusk of plans, the Mid-Autumn moon with lanterns rising, the izakaya's amber, and the
 * birthday in lily red with gold in the air. Colours in story-part-three.css.
 */
export const PartThreeAtmosphere = memo(function PartThreeAtmosphere({ reducedMotion = false }: PartThreeAtmosphereProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  usePointerGlow(rootRef, reducedMotion);

  return (
    <div className="part-two-atmosphere part-three-atmosphere" aria-hidden="true" ref={rootRef}>
      <div className="offline-mood offline-mood-night p3-sky p3-sky-velvet">
        <div className="aurora p3-aurora-velvet-one" />
        <div className="aurora p3-aurora-velvet-two" />
        <div className="p3-sky-beam" data-water-depth="0.3" />
        <div className="p3-sky-specks" data-water-depth="0.8" />
      </div>
      <div className="offline-mood p3-sky p3-sky-screen" data-offline-mood>
        <div className="aurora p3-aurora-screen" />
        <div className="p3-sky-bokeh" data-water-depth="0.5" />
      </div>
      <div className="offline-mood p3-sky p3-sky-afternoon" data-offline-mood>
        <div className="aurora p3-aurora-afternoon" />
        <div className="p3-sky-sunlight" data-water-depth="0.3" />
      </div>
      <div className="offline-mood p3-sky p3-sky-heritage" data-offline-mood>
        <div className="aurora p3-aurora-heritage" />
        <div className="p3-sky-specks is-dust" data-water-depth="0.6" />
      </div>
      <div className="offline-mood p3-sky p3-sky-lotus" data-offline-mood>
        <div className="aurora p3-aurora-lotus" />
        <div className="p3-sky-ripples" data-water-depth="0.4" />
      </div>
      <div className="offline-mood p3-sky p3-sky-rain" data-offline-mood>
        <div className="p3-sky-rainfall" />
        <div className="p3-sky-dusk" data-water-depth="0.2" />
      </div>
      <div className="offline-mood p3-sky p3-sky-neon" data-offline-mood>
        <div className="aurora p3-aurora-neon" />
        <div className="p3-sky-rainfall is-soft" />
      </div>
      <div className="offline-mood p3-sky p3-sky-clinic" data-offline-mood>
        <div className="aurora p3-aurora-clinic" />
      </div>
      <div className="offline-mood p3-sky p3-sky-lakeside" data-offline-mood>
        <div className="aurora p3-aurora-lakeside" />
        <div className="p3-sky-bokeh is-city" data-water-depth="0.5" />
      </div>
      <div className="offline-mood p3-sky p3-sky-notebook" data-offline-mood>
        <div className="aurora p3-aurora-notebook" />
        <div className="p3-sky-sunlight" data-water-depth="0.3" />
      </div>
      <div className="offline-mood p3-sky p3-sky-acoustic" data-offline-mood>
        <div className="aurora p3-aurora-acoustic" />
        <div className="p3-sky-specks" data-water-depth="0.8" />
      </div>
      <div className="offline-mood p3-sky p3-sky-planner" data-offline-mood>
        <div className="aurora p3-aurora-planner" />
      </div>
      <div className="offline-mood p3-sky p3-sky-lantern" data-offline-mood>
        <div className="aurora p3-aurora-lantern" />
        <div className="p3-sky-lanterns" data-water-depth="0.6" />
      </div>
      <div className="offline-mood p3-sky p3-sky-bento" data-offline-mood>
        <div className="aurora p3-aurora-bento" />
      </div>
      <div className="offline-mood p3-sky p3-sky-birthday" data-offline-mood>
        <div className="aurora p3-aurora-birthday-one" />
        <div className="aurora p3-aurora-birthday-two" />
        <div className="p3-sky-specks is-gold" data-water-depth="0.8" />
      </div>
      <div className="offline-pointer-glow" />
      <div className="offline-reading-shade" />
    </div>
  );
});
