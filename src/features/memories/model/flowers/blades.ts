import * as THREE from "three";
import { clamp01, gridGeometry, mix, smoothstep } from "./common";

/**
 * Thin parts shared by every flower: blades (ray petals, bracts, sepals) and leaves. Each is a grid along +Y facing +Z
 * whose shape comes entirely from a spec, so no two need ever be the same.
 */

export interface BladeSpec {
  length: number;
  /** Half the widest width. */
  width: number;
  /** Where along the length the blade is widest (0..1). */
  peak: number;
  /** Width at the base, as a share of the widest. */
  claw: number;
  /** Width at the tip, as a share of the widest. */
  tipWidth: number;
  /** How rounded the tip edge is. */
  round: number;
  /** Small teeth at the tip of a ray: 0, 2 or 3. */
  teeth: number;
  toothDepth: number;
  /** Backward bend toward the tip in radians (negative bends forward). */
  curl: number;
  curlPower: number;
  /** Edges raised toward the face (share of the half width). */
  cup: number;
  /** Depth of the groove along the midline (share of the half width). */
  channel: number;
  twist: number;
  sideBend: number;
  ruffle: number;
  ruffleWaves: number;
  rufflePhase: number;
  /** Lengthwise pleats from the veins. */
  folds: number;
  foldDepth: number;
}

export interface BladeColors {
  base: THREE.Color;
  body: THREE.Color;
  tip: THREE.Color;
  /** Darkening at the base, where neighbours and the disc shade it (1 = none). */
  occlusion: number;
}

/**
 * The midline of a part that bends back along its length, integrated in small steps so it keeps its length however far
 * it curls. Returns, for a share of the length (0..1), the height and depth of the midline and the angle of the bend.
 */
function bentMidline(length: number, curl: number, curlPower: number): (share: number) => [number, number, number] {
  const steps = 48;
  const centre = new Float32Array((steps + 1) * 3);
  const ds = length / steps;
  let y = 0;
  let z = 0;
  for (let index = 0; index <= steps; index += 1) {
    centre[index * 3] = y;
    centre[index * 3 + 1] = z;
    centre[index * 3 + 2] = curl * Math.pow(index / steps, curlPower);
    const bend = curl * Math.pow((index + 0.5) / steps, curlPower);
    y += Math.cos(bend) * ds;
    z -= Math.sin(bend) * ds;
  }
  return (share) => {
    const f = clamp01(share) * steps;
    const index = Math.min(steps - 1, Math.floor(f));
    const t = f - index;
    return [mix(centre[index * 3], centre[index * 3 + 3], t), mix(centre[index * 3 + 1], centre[index * 3 + 4], t), mix(centre[index * 3 + 2], centre[index * 3 + 5], t)];
  };
}

/**
 * A thin blade along +Y facing +Z: a ray petal, a bract or a sepal. Its midline bends back along its length, its
 * cross-section cups and pleats, it twists toward the tip and its edges ripple, all from the spec, so every blade is
 * its own.
 */
export function bladeGeometry(spec: BladeSpec, colors: BladeColors, columns = 8, rows = 18): THREE.BufferGeometry {
  const midline = bentMidline(spec.length, spec.curl, spec.curlPower);
  return gridGeometry(columns, rows, (u, v, position, color) => {
    const across = u * 2 - 1;
    const tooth = spec.teeth === 3 ? 0.5 - 0.5 * Math.cos(3 * Math.PI * across) : spec.teeth === 2 ? 0.5 + 0.5 * Math.cos(2 * Math.PI * across) : 0;
    const reach = 1 - spec.round * across * across - spec.toothDepth * tooth;
    const s = v * reach * spec.length;
    const rise = Math.sin((Math.PI / 2) * Math.min(1, v / spec.peak));
    const fall = smoothstep(spec.peak, 1, v);
    const half = spec.width * (spec.claw + (1 - spec.claw) * Math.pow(rise, 0.7)) * (1 - (1 - spec.tipWidth) * Math.pow(fall, 1.5));
    const x = across * half;
    const edge = Math.abs(across);
    const relief =
      spec.cup * across * across * half
      - spec.channel * half * Math.exp(-(across * across) / 0.03) * (1 - v * 0.7)
      + spec.foldDepth * Math.cos(Math.PI * spec.folds * across) * Math.sin(Math.PI * Math.min(1, v * 1.15)) * (1 - Math.pow(edge, 4))
      + spec.ruffle * Math.pow(edge, 2.5) * Math.sin(Math.PI * 2 * spec.ruffleWaves * v + spec.rufflePhase + across) * smoothstep(0.12, 0.55, v);
    const turn = spec.twist * Math.pow(v, 1.4);
    const tx = x * Math.cos(turn) - relief * Math.sin(turn);
    const tz = x * Math.sin(turn) + relief * Math.cos(turn);
    const [cy, cz, angle] = midline(s / spec.length);
    position.set(tx + spec.sideBend * spec.length * v * v, cy + tz * Math.sin(angle), cz + tz * Math.cos(angle));
    color.copy(colors.base).lerp(colors.body, smoothstep(0, 0.3, v));
    color.lerp(colors.tip, smoothstep(0.55, 1, v) * 0.45 + Math.pow(edge, 3) * 0.15 * smoothstep(0.2, 0.9, v));
    color.multiplyScalar(mix(colors.occlusion, 1, smoothstep(0, 0.35, v)));
  });
}

export interface LeafSpec {
  length: number;
  width: number;
  /** Where along the length the leaf is widest (0..1). */
  peak: number;
  /** Outline exponent: lower is fuller (at 0.5, with the width half the length, nearly a circle). */
  fullness: number;
  /** Lobes either side of the stalk, as a share of the width. */
  cordate: number;
  /** How drawn out the tip is, 0 (plain) to about 0.5. */
  acuminate: number;
  teeth: number;
  toothDepth: number;
  curl: number;
  curlPower: number;
  /** Halves folded up along the midrib. */
  fold: number;
  wave: number;
  waves: number;
  wavePhase: number;
  twist: number;
  sideBend: number;
  /** Depth of the sunken midrib, as a share of the width. */
  midrib: number;
}

/**
 * A leaf along +Y facing +Z: its outline from the spec (heart-based or tapering, round or drawn out to a tip), a
 * serrated margin whose teeth point to the tip, a sunken midrib, halves folded slightly up, a wavy edge, and a droop
 * that grows toward the tip.
 */
export function leafGeometry(spec: LeafSpec, colors: BladeColors, columns = 12, rows = 26): THREE.BufferGeometry {
  const midline = bentMidline(spec.length, spec.curl, spec.curlPower);
  const exponent = Math.log(0.5) / Math.log(spec.peak);
  return gridGeometry(columns, rows, (u, v, position, color) => {
    const across = u * 2 - 1;
    const edge = Math.abs(across);
    const outline = (Math.pow(Math.sin(Math.PI * Math.pow(v, exponent)), spec.fullness) + spec.cordate * Math.exp(-Math.pow((v - 0.06) / 0.07, 2)))
      * (1 - spec.acuminate * smoothstep(0.55, 1, v));
    const saw = (v * spec.teeth) % 1;
    const tooth = saw < 0.78 ? saw / 0.78 : (1 - saw) / 0.22;
    const serration = 1 - spec.toothDepth * (1 - tooth) * Math.pow(edge, 6) * smoothstep(0.04, 0.16, v) * smoothstep(1, 0.88, v);
    const half = spec.width * outline;
    const x = across * half * serration;
    const relief = spec.fold * edge * half
      - spec.midrib * spec.width * Math.exp(-(across * across) / 0.004) * (1 - v * 0.8)
      + spec.wave * edge * edge * Math.sin(Math.PI * 2 * spec.waves * v + spec.wavePhase * Math.sign(across)) * smoothstep(0.1, 0.4, v);
    const turn = spec.twist * Math.pow(v, 1.3);
    const tx = x * Math.cos(turn) - relief * Math.sin(turn);
    const tz = x * Math.sin(turn) + relief * Math.cos(turn);
    const [cy, cz, angle] = midline(v);
    position.set(tx + spec.sideBend * spec.length * v * v, cy + tz * Math.sin(angle), cz + tz * Math.cos(angle));
    color.copy(colors.base).lerp(colors.body, smoothstep(0, 0.25, v));
    color.lerp(colors.tip, Math.pow(edge, 4) * smoothstep(0.3, 1, v) * 0.6);
    color.multiplyScalar(mix(colors.occlusion, 1, smoothstep(0, 0.3, v)));
  });
}
