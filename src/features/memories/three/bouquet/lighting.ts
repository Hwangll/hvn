import * as THREE from "three";

export type LightPresetName = "golden" | "moonlight" | "ember";

interface LightSpec {
  color: number;
  intensity: number;
  /** Offset from the bouquet in focus. */
  offset: [number, number, number];
}

export interface LightPreset {
  key: LightSpec;
  rim: LightSpec;
  fill: { sky: number; ground: number; intensity: number };
  environment: number;
  exposure: number;
  bloom: number;
  /** Colour of the dust drifting through the light. */
  dust: number;
  /** The grade after tone mapping (see postprocessing): contrast as a power, and saturation. */
  look: { power: number; saturation: number };
}

/**
 * Golden hour for the sunflowers: a warm key from the left, far enough round to model every petal, and a low amber sun
 * behind, so the petals glow at the rim. Moonlight for the hydrangeas: a cool key from the right and a cold blue rim
 * from behind the left. Lantern light for the red lilies: a rose-white key high in front, into the open blooms, and a
 * red-gold lantern behind the right that sets the tepals glowing through.
 */
export const lightPresets: Record<LightPresetName, LightPreset> = {
  golden: {
    key: { color: 0xffecd6, intensity: 2.3, offset: [-4.2, 3.6, 2.9] },
    rim: { color: 0xffc98f, intensity: 3.2, offset: [2.9, 1.7, -3.5] },
    fill: { sky: 0x4a3a46, ground: 0x0c090b, intensity: 0.5 },
    environment: 0.24,
    exposure: 1.05,
    bloom: 0.08,
    dust: 0xffcf8f,
    // Punchy enough to keep sunflower yellow golden instead of apricot.
    look: { power: 1.25, saturation: 1.4 },
  },
  moonlight: {
    key: { color: 0xd3e2ff, intensity: 2.1, offset: [4, 4, 2.8] },
    rim: { color: 0x8ab6ff, intensity: 3, offset: [-2.8, 2.9, -3.3] },
    fill: { sky: 0x22344f, ground: 0x04070d, intensity: 0.55 },
    environment: 0.22,
    exposure: 1,
    bloom: 0.07,
    dust: 0xa8d4ff,
    // Softer: blue petals saturate easily, and moonlight should feel hushed.
    look: { power: 1.15, saturation: 1.1 },
  },
  ember: {
    key: { color: 0xfff0ec, intensity: 2.7, offset: [-2.8, 3.6, 4.2] },
    rim: { color: 0xff8a5a, intensity: 3.6, offset: [3, 2, -3.4] },
    fill: { sky: 0x4a1d28, ground: 0x0e0507, intensity: 0.55 },
    environment: 0.24,
    exposure: 1.05,
    bloom: 0.08,
    dust: 0xffb48c,
    // Between the two: crimson needs some punch to stay red in the shadows, and too much would flatten it.
    look: { power: 1.2, saturation: 1.3 },
  },
};

const HOVER_WARMTH = new THREE.Color(0xffc283);

/**
 * A dark studio for reflections: a near-black room lit by one large warm softbox, a cool strip behind and a dim panel
 * overhead. Built in code and prefiltered once, so it costs no download; at low intensity it gives petals and leaves a
 * believable specular life without lighting the scene flat.
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const room = new THREE.Scene();
  const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];
  const add = (geometry: THREE.BufferGeometry, color: THREE.Color, position: [number, number, number], side: THREE.Side = THREE.FrontSide) => {
    const material = new THREE.MeshBasicMaterial({ color, side });
    const panel = new THREE.Mesh(geometry, material);
    panel.position.set(...position);
    panel.lookAt(0, 0, 0);
    room.add(panel);
    disposables.push(geometry, material);
    return panel;
  };
  const walls = new THREE.Mesh(new THREE.BoxGeometry(12, 7, 12), new THREE.MeshBasicMaterial({ color: 0x0b0a0d, side: THREE.BackSide }));
  disposables.push(walls.geometry, walls.material as THREE.Material);
  room.add(walls);
  add(new THREE.PlaneGeometry(3.4, 2.2), new THREE.Color(0xfff1df).multiplyScalar(6), [-3.6, 2.4, 3.2]);
  add(new THREE.PlaneGeometry(0.7, 3.6), new THREE.Color(0xdfe8ff).multiplyScalar(4.5), [3.9, 1.4, -3.4]);
  add(new THREE.PlaneGeometry(4, 4), new THREE.Color(0xffffff).multiplyScalar(0.7), [0, 3.4, 0]);
  add(new THREE.PlaneGeometry(12, 12), new THREE.Color(0x070607), [0, -3.4, 0]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(room, 0.035);
  pmrem.dispose();
  disposables.forEach((item) => item.dispose());
  return target.texture;
}

interface LiveLight {
  color: THREE.Color;
  intensity: number;
  offset: THREE.Vector3;
}

function live(spec: LightSpec): LiveLight {
  return { color: new THREE.Color(spec.color), intensity: spec.intensity, offset: new THREE.Vector3(...spec.offset) };
}

/**
 * The key, the rim and a faint fill, kept on the bouquet in focus. Preset changes and the hover warmth ease in rather
 * than snap; update() advances them and reports whether anything is still changing, so a still scene can stop drawing.
 */
export class StudioLights {
  readonly key = new THREE.DirectionalLight();
  readonly rim = new THREE.DirectionalLight();
  readonly fill = new THREE.HemisphereLight();
  readonly focus = new THREE.Vector3();
  private readonly focusGoal = new THREE.Vector3();
  private preset: LightPreset;
  private current: {
    key: LiveLight;
    rim: LiveLight;
    fillSky: THREE.Color;
    fillGround: THREE.Color;
    fill: number;
    environment: number;
    exposure: number;
    bloom: number;
    dust: THREE.Color;
    lookPower: number;
    lookSaturation: number;
  };
  private hover = 0;
  private hoverGoal = 0;
  private readonly scratch = new THREE.Color();
  private readonly scratchVector = new THREE.Vector3();

  constructor(private readonly scene: THREE.Scene, presetName: LightPresetName) {
    this.preset = lightPresets[presetName];
    const preset = this.preset;
    this.current = {
      key: live(preset.key),
      rim: live(preset.rim),
      fillSky: new THREE.Color(preset.fill.sky),
      fillGround: new THREE.Color(preset.fill.ground),
      fill: preset.fill.intensity,
      environment: preset.environment,
      exposure: preset.exposure,
      bloom: preset.bloom,
      dust: new THREE.Color(preset.dust),
      lookPower: preset.look.power,
      lookSaturation: preset.look.saturation,
    };
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    const shadowCamera = this.key.shadow.camera;
    shadowCamera.left = -1.8;
    shadowCamera.right = 1.8;
    shadowCamera.top = 2.1;
    shadowCamera.bottom = -1.6;
    shadowCamera.near = 0.5;
    shadowCamera.far = 14;
    this.key.shadow.normalBias = 0.02;
    this.key.shadow.bias = -0.0004;
    scene.add(this.key, this.key.target, this.rim, this.rim.target, this.fill);
    this.apply();
  }

  get exposure(): number {
    return this.current.exposure;
  }

  get bloom(): number {
    return this.current.bloom;
  }

  get dust(): THREE.Color {
    return this.current.dust;
  }

  get lookPower(): number {
    return this.current.lookPower;
  }

  get lookSaturation(): number {
    return this.current.lookSaturation;
  }

  setPreset(name: LightPresetName, instant = false): void {
    this.preset = lightPresets[name];
    if (instant) this.snap();
  }

  setHover(hovering: boolean): void {
    this.hoverGoal = hovering ? 1 : 0;
  }

  setFocus(position: THREE.Vector3, instant = false): void {
    this.focusGoal.copy(position);
    if (instant) this.focus.copy(position);
  }

  setShadowMapSize(size: number): void {
    if (this.key.shadow.mapSize.x === size) return;
    this.key.shadow.mapSize.set(size, size);
    this.key.shadow.map?.dispose();
    this.key.shadow.map = null;
  }

  private snap(): void {
    const preset = this.preset;
    this.current.key = live(preset.key);
    this.current.rim = live(preset.rim);
    this.current.fillSky.setHex(preset.fill.sky);
    this.current.fillGround.setHex(preset.fill.ground);
    this.current.fill = preset.fill.intensity;
    this.current.environment = preset.environment;
    this.current.exposure = preset.exposure;
    this.current.bloom = preset.bloom;
    this.current.dust.setHex(preset.dust);
    this.current.lookPower = preset.look.power;
    this.current.lookSaturation = preset.look.saturation;
    this.apply();
  }

  /** Eases every value toward its goal; `rate` is per second. Returns true while something is still moving. */
  update(seconds: number, rate = 2.6): boolean {
    const t = 1 - Math.exp(-seconds * rate);
    const preset = this.preset;
    const current = this.current;
    let moving = false;
    const ease = (from: number, to: number) => {
      if (Math.abs(to - from) > 1e-3) moving = true;
      return from + (to - from) * t;
    };
    const easeColor = (color: THREE.Color, hex: number) => {
      this.scratch.setHex(hex);
      if (Math.abs(color.r - this.scratch.r) + Math.abs(color.g - this.scratch.g) + Math.abs(color.b - this.scratch.b) > 2e-3) moving = true;
      color.lerp(this.scratch, t);
    };
    for (const [light, spec] of [[current.key, preset.key], [current.rim, preset.rim]] as const) {
      easeColor(light.color, spec.color);
      light.intensity = ease(light.intensity, spec.intensity);
      const goal = this.scratchVector.set(...spec.offset);
      if (light.offset.distanceToSquared(goal) > 1e-5) moving = true;
      light.offset.lerp(goal, t);
    }
    easeColor(current.fillSky, preset.fill.sky);
    easeColor(current.fillGround, preset.fill.ground);
    current.fill = ease(current.fill, preset.fill.intensity);
    current.environment = ease(current.environment, preset.environment);
    current.exposure = ease(current.exposure, preset.exposure);
    current.bloom = ease(current.bloom, preset.bloom);
    easeColor(current.dust, preset.dust);
    current.lookPower = ease(current.lookPower, preset.look.power);
    current.lookSaturation = ease(current.lookSaturation, preset.look.saturation);
    this.hover = ease(this.hover, this.hoverGoal);
    if (this.focus.distanceToSquared(this.focusGoal) > 1e-6) moving = true;
    this.focus.lerp(this.focusGoal, 1 - Math.exp(-seconds * 5));
    this.apply();
    return moving;
  }

  private apply(): void {
    const current = this.current;
    const hover = this.hover;
    // Hovering warms the key a touch and lifts it, like leaning closer to a lamp.
    this.key.color.copy(current.key.color).lerp(HOVER_WARMTH, hover * 0.22);
    this.key.intensity = current.key.intensity * (1 + hover * 0.16);
    this.key.position.copy(this.focus).add(current.key.offset);
    this.key.target.position.copy(this.focus).setY(this.focus.y + 0.1);
    this.rim.color.copy(current.rim.color);
    this.rim.intensity = current.rim.intensity * (1 + hover * 0.08);
    this.rim.position.copy(this.focus).add(current.rim.offset);
    this.rim.target.position.copy(this.focus).setY(this.focus.y + 0.3);
    this.fill.color.copy(current.fillSky);
    this.fill.groundColor.copy(current.fillGround);
    this.fill.intensity = current.fill;
    this.scene.environmentIntensity = current.environment;
  }
}
