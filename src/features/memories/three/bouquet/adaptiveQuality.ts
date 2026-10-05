/**
 * Watches frame times and steps the rendering down when a machine cannot keep up: first the depth of field, then the
 * glow and some resolution, then more resolution. It only ever steps down, after a sustained slowdown, so it never
 * flickers between looks.
 */

export type QualityTier = 0 | 1 | 2 | 3;

export interface TierSettings {
  pixelRatio: number;
  depthOfField: boolean;
  bloom: boolean;
  finish: boolean;
  shadowMapSize: number;
}

export function tierSettings(tier: QualityTier, devicePixelRatio: number): TierSettings {
  const ratio = (cap: number) => Math.min(devicePixelRatio, cap);
  switch (tier) {
    case 3:
      return { pixelRatio: ratio(2), depthOfField: true, bloom: true, finish: true, shadowMapSize: 2048 };
    case 2:
      return { pixelRatio: ratio(1.5), depthOfField: false, bloom: true, finish: true, shadowMapSize: 2048 };
    case 1:
      return { pixelRatio: ratio(1.25), depthOfField: false, bloom: false, finish: true, shadowMapSize: 1024 };
    default:
      return { pixelRatio: 1, depthOfField: false, bloom: false, finish: false, shadowMapSize: 1024 };
  }
}

/**
 * Where to start: phones and small machines skip the depth of field. A phone's canvas is small, so it keeps a sharp
 * pixel ratio and the glow; a phone that still cannot keep up steps down from there within a couple of seconds.
 */
export function startingTier({ coarsePointer, cores }: { coarsePointer: boolean; cores: number }): QualityTier {
  if (coarsePointer || cores <= 4) return 2;
  return 3;
}

export class AdaptiveQuality {
  tier: QualityTier;
  private average = 0;
  private fastest = Infinity;
  private samples = 0;
  private slowFor = 0;
  private cooldown = 0;

  constructor(tier: QualityTier, private readonly onChange: (tier: QualityTier) => void) {
    this.tier = tier;
  }

  /** Feed one frame's duration in ms. */
  sample(frameMs: number): void {
    // Ignore stalls (tab switches, the first shader compiles) and the first frames, which are never representative.
    if (frameMs > 250) return;
    this.samples += 1;
    if (this.samples < 45) {
      this.fastest = Math.min(this.fastest, frameMs);
      this.average = frameMs;
      return;
    }
    this.fastest = Math.min(this.fastest, Math.max(frameMs, 4));
    this.average += (frameMs - this.average) * 0.06;
    if (this.cooldown > 0) {
      this.cooldown -= frameMs;
      return;
    }
    // The display's own interval (8.3 ms at 120 Hz, 16.7 at 60) is the yardstick: well over it for over a second is slow.
    const budget = Math.min(Math.max(this.fastest, 6.9), 16.7) * 1.45;
    this.slowFor = this.average > budget ? this.slowFor + frameMs : 0;
    if (this.slowFor > 1200 && this.tier > 0) {
      this.tier = (this.tier - 1) as QualityTier;
      this.slowFor = 0;
      this.cooldown = 2500;
      this.average = this.fastest;
      this.onChange(this.tier);
    }
  }
}
