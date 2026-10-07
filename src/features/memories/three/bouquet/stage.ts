import * as THREE from "three";
import { bouquetSources, type BouquetSource } from "../../model/bouquetSources";
import { createIntroFlower, disposeIntroFlower, introFlowerSteps, type IntroFlowerVariant } from "../../model/introFlowers";
import { AdaptiveQuality, startingTier, tierSettings, type QualityTier } from "./adaptiveQuality";
import { CameraRig, type RigLimits, type RigPose } from "./cameraRig";
import { CONTACT_SHADOW_LAYER, ContactShadow } from "./contactShadow";
import { StudioLights, createStudioEnvironment, type LightPresetName } from "./lighting";
import { plantWind } from "./plantMaterial";
import { BouquetPost } from "./postprocessing";

const PRESET: Record<IntroFlowerVariant, LightPresetName> = { sunflower: "golden", hydrangea: "moonlight", lily: "ember" };
/** Between neighbouring plinths: far enough apart that only one is ever in frame at rest. */
const STATION_GAP = 7.2;
/** The plinths stand in a row in the parts' order; switching is a dolly along it, past any plinth between. */
const STATION_X: Record<IntroFlowerVariant, number> = { sunflower: -STATION_GAP, hydrangea: 0, lily: STATION_GAP };
/** Lacquered dark stone with a metal inlay: brass under sunflowers, silver under hydrangeas, rose gold under lilies. */
const PLINTH: Record<IntroFlowerVariant, { stone: number; inlay: number }> = {
  sunflower: { stone: 0x0d0c0f, inlay: 0xb2925f },
  hydrangea: { stone: 0x0a0f17, inlay: 0x9aa9ba },
  lily: { stone: 0x140709, inlay: 0xd09a86 },
};
/** Bouquet-space height of the plinth's top, where the wrap stands. */
const PLINTH_TOP = -1.16;
const LOOK_HEIGHT = 0.1;
/** The faces three's shadow pass draws for each side of a material (WebGLShadowMap): one-sided surfaces cast from the back. */
const SHADOW_SIDE: Record<THREE.Side, THREE.Side> = { [THREE.FrontSide]: THREE.BackSide, [THREE.BackSide]: THREE.FrontSide, [THREE.DoubleSide]: THREE.DoubleSide };

export interface BouquetStageOptions {
  variant: IntroFlowerVariant;
  reducedMotion: boolean;
  /** windStrength: tip travel in bouquet units; windSpeed: how quickly gusts come and go. */
  wind?: { strength?: number; speed?: number };
  /** Where each bouquet comes from, over the defaults in model/bouquetSources. */
  sources?: Partial<Record<IntroFlowerVariant, BouquetSource>>;
  /** The first frame is on screen. */
  onReady?: () => void;
  onContextLost?: () => void;
}

export interface BouquetStage {
  setVariant(variant: IntroFlowerVariant): void;
  dispose(): void;
}

interface Station {
  variant: IntroFlowerVariant;
  group: THREE.Group;
  specimen: THREE.Group;
  /** The bouquet, once built or loaded; until then the plinth stands empty. */
  root: THREE.Group | null;
  bouquet: THREE.Object3D | null;
  shadow: ContactShadow;
  idlePhase: number;
  /** Its programs are compiled and its textures uploaded, so it can be drawn in passing without a stall. */
  warmed: boolean;
  disposables: Array<THREE.BufferGeometry | THREE.Material>;
}

function framing(aspect: number): { limits: RigLimits; home: RigPose; scale: number } {
  const narrow = aspect < 0.78;
  const distance = narrow ? 5.75 : 5.3;
  return {
    scale: narrow ? 0.82 : 0.9,
    home: { azimuth: 0, polar: 1.545, distance },
    limits: { azimuth: [-0.62, 0.62], polar: [1.2, 1.62], distance: [distance - 0.8, distance + 1.1] },
  };
}

/** A plinth, its contact shadow and room for a bouquet (see attachSpecimen). */
function buildStation(variant: IntroFlowerVariant): Station {
  const group = new THREE.Group();
  group.name = `station-${variant}`;
  group.position.x = STATION_X[variant];
  const specimen = new THREE.Group();
  const colors = PLINTH[variant];
  const stoneGeometry = new THREE.CylinderGeometry(1.08, 1.13, 0.16, 96);
  // Honed rather than polished: seen this low, a glossy top would mirror the rim light behind the bouquet and flash grey
  // as the camera moves.
  const stoneMaterial = new THREE.MeshPhysicalMaterial({ color: colors.stone, roughness: 0.62, metalness: 0, specularIntensity: 0.15 });
  const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
  stone.position.y = PLINTH_TOP - 0.08;
  stone.receiveShadow = true;
  const inlayGeometry = new THREE.TorusGeometry(1.03, 0.0075, 8, 192);
  const inlayMaterial = new THREE.MeshStandardMaterial({ color: colors.inlay, metalness: 1, roughness: 0.42 });
  const inlay = new THREE.Mesh(inlayGeometry, inlayMaterial);
  inlay.rotation.x = Math.PI / 2;
  inlay.position.y = PLINTH_TOP + 0.001;
  const shadow = new ContactShadow({ width: 2.2, depth: 2.2, reach: 1.1, resolution: 512, blur: 2.2, opacity: 0.92 });
  shadow.group.position.y = PLINTH_TOP + 0.002;
  specimen.add(stone, inlay, shadow.group);
  group.add(specimen);
  return { variant, group, specimen, root: null, bouquet: null, shadow, idlePhase: 0, warmed: false, disposables: [stoneGeometry, stoneMaterial, inlayGeometry, inlayMaterial] };
}

function attachSpecimen(station: Station, root: THREE.Group): void {
  ContactShadow.cast(root);
  station.root = root;
  station.bouquet = root.getObjectByName("bouquet") ?? root;
  station.specimen.add(root);
}

/**
 * Calls back in the next quiet moment with the milliseconds it may use, so work done there never costs a frame.
 * Without idle callbacks (Safari) that is one short slice after each frame.
 */
function nextSlice(callback: (budget: number) => void): void {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback((deadline) => callback(Math.min(12, Math.max(4, deadline.timeRemaining()))), { timeout: 500 });
    return;
  }
  requestAnimationFrame(() => window.setTimeout(() => callback(6), 0));
}

/**
 * Starts compiling the programs the key light's shadow pass will draw a bouquet with: each plant's shadow twin
 * (plantDepthMaterial), dressed for each mesh the way three's shadow pass dresses it. Left to the shadow pass, each one
 * is compiled, and waited for, the first time its plant comes into the light's view: in the middle of a flight to it.
 */
function compileShadowTwins(renderer: THREE.WebGLRenderer, root: THREE.Object3D, camera: THREE.Camera, scene: THREE.Scene): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.castShadow || !(child.customDepthMaterial instanceof THREE.MeshDepthMaterial)) return;
    const twin = child.customDepthMaterial;
    const own = child.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
    for (const material of Array.isArray(own) ? own : [own]) {
      if (!material.visible) continue;
      twin.side = material.shadowSide ?? SHADOW_SIDE[material.side];
      twin.map = material.map;
      twin.alphaMap = material.alphaMap;
      twin.alphaTest = material.alphaToCoverage ? 0.5 : material.alphaTest;
      twin.displacementMap = material.displacementMap;
      child.material = twin;
      renderer.compile(child, camera, scene);
    }
    child.material = own;
  });
}

/** Dust hanging in the light: a hundred-odd soft points along the row of plinths, so a camera move reads as one. */
function buildDust(): { points: THREE.Points; speeds: Float32Array; texture: THREE.Texture | null } {
  const count = 110;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const random = (salt: number) => {
      const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };
    positions[index * 3] = -STATION_GAP * 1.5 + random(1) * STATION_GAP * 3;
    positions[index * 3 + 1] = -1.1 + random(2) * 3.4;
    positions[index * 3 + 2] = -2.6 + random(3) * 4.4;
    speeds[index] = 0.025 + random(4) * 0.05;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  let texture: THREE.Texture | null = null;
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d");
    if (context) {
      const glow = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      glow.addColorStop(0, "rgba(255,255,255,1)");
      glow.addColorStop(0.35, "rgba(255,255,255,0.35)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, 64, 64);
      texture = new THREE.CanvasTexture(canvas);
    }
  }
  const material = new THREE.PointsMaterial({ size: 0.034, map: texture, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, speeds, texture };
}

/**
 * The cabinet the keepsakes stand in: one transparent canvas over the HTML room, every bouquet on its own plinth in one
 * scene, lit for the part on show. Switching parts flies the camera along the row to another plinth while the light
 * turns, from golden hour to moonlight or lantern light. The visitor can turn and zoom within limits; left alone, the
 * bouquet turns slowly on its own and the view drifts back to its best side. Drawing stops whenever the cabinet is off
 * screen or the tab is hidden.
 *
 * The bouquet on show is built (or loaded) first and shown as soon as its shaders are ready; the others follow one
 * after another, nearest first, when the browser is idle, with their shaders compiled and textures uploaded ahead of
 * any flight to or past them.
 */
export function mountBouquetStage(container: HTMLElement, options: BouquetStageOptions): BouquetStage {
  const { reducedMotion } = options;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const environment = createStudioEnvironment(renderer);
  scene.environment = environment;
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 30);

  const stations: Record<IntroFlowerVariant, Station> = { sunflower: buildStation("sunflower"), hydrangea: buildStation("hydrangea"), lily: buildStation("lily") };
  const row = Object.values(stations);
  row.forEach((station) => scene.add(station.group));
  let active = stations[options.variant];
  // What is drawn: the plinth on show and, while the camera flies, the one it left and any ready along the way.
  let drawn = new Set<Station>();
  const show = (next: Set<Station>) => {
    drawn = next;
    row.forEach((station) => (station.group.visible = drawn.has(station)));
  };
  show(new Set([active]));
  const sources: Record<IntroFlowerVariant, BouquetSource> = { ...bouquetSources, ...options.sources };

  const lights = new StudioLights(scene, PRESET[options.variant]);
  lights.key.shadow.radius = 4;
  // The contact shadows draw the same scene with the same lights in view, so three's light setup never changes between
  // passes: lit materials keep their programs, and each plant's shadow is drawn with the one program warm() compiles.
  for (const light of [lights.key, lights.rim, lights.fill]) light.layers.enable(CONTACT_SHADOW_LAYER);
  const focusOf = (station: Station, out = new THREE.Vector3()) => out.set(station.group.position.x, 0.25, 0.1);
  lights.setFocus(focusOf(active), true);

  const dust = buildDust();
  if (!reducedMotion) scene.add(dust.points);

  plantWind.configure({ windStrength: reducedMotion ? 0 : options.wind?.strength ?? 0.03, windSpeed: options.wind?.speed ?? 0.6 });

  const post = new BouquetPost(renderer);
  const frame = framing(1);
  const rig = new CameraRig(camera, canvas, { limits: frame.limits, home: frame.home });
  const lookAt = (station: Station) => new THREE.Vector3(station.group.position.x, LOOK_HEIGHT, 0);
  rig.jumpTo(lookAt(active));

  const coarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  const quality = new AdaptiveQuality(startingTier({ coarsePointer: coarse, cores: navigator.hardwareConcurrency || 4 }), (tier) => applyTier(tier));

  let frameId = 0;
  let last = 0;
  let frameCount = 0;
  let visible = true;
  let ready = false;
  let disposed = false;
  let idleWeight = 0;
  const focusPoint = new THREE.Vector3();

  function wake(): void {
    if (disposed || frameId || !visible || document.hidden || !ready) return;
    last = performance.now();
    frameId = requestAnimationFrame(tick);
  }

  function resize(): void {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    const ratio = renderer.getPixelRatio();
    post.setSize(width * ratio, height * ratio);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const next = framing(camera.aspect);
    rig.setFraming(next.limits, next.home);
    row.forEach((station) => station.specimen.scale.setScalar(next.scale));
    wake();
  }

  function applyTier(tier: QualityTier): void {
    const settings = tierSettings(tier, window.devicePixelRatio || 1);
    renderer.setPixelRatio(settings.pixelRatio);
    post.effects = { depthOfField: settings.depthOfField, bloom: settings.bloom, finish: settings.finish };
    lights.setShadowMapSize(settings.shadowMapSize);
    resize();
  }

  function step(seconds: number, now: number): boolean {
    let moving = false;
    if (!reducedMotion) plantWind.advance(seconds);
    const wasFlying = rig.flying;
    if (rig.update(seconds)) moving = true;
    if (wasFlying && !rig.flying) show(new Set([active]));
    if (!reducedMotion) {
      // Left alone, the bouquet turns slowly back and forth; a hand on it stops the turn where it is.
      const resting = !rig.dragging && !rig.flying && rig.idleSeconds(now) > 3.5;
      idleWeight += ((resting ? 1 : 0) - idleWeight) * (1 - Math.exp(-seconds * 1.5));
      active.idlePhase += seconds * idleWeight * ((Math.PI * 2) / 30);
      if (active.bouquet) active.bouquet.rotation.y = 0.42 * Math.sin(active.idlePhase);
      if (rig.idleSeconds(now) > 7 && !rig.flying) rig.relax(seconds);
      const positions = dust.points.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let index = 0; index < dust.speeds.length; index += 1) {
        let y = positions.getY(index) + dust.speeds[index] * seconds;
        if (y > 2.3) y = -1.1;
        positions.setY(index, y);
        positions.setX(index, positions.getX(index) + Math.sin(now * 0.0003 + index) * 0.012 * seconds);
      }
      positions.needsUpdate = true;
      (dust.points.material as THREE.PointsMaterial).color.copy(lights.dust);
      moving = true;
    }
    if (lights.update(seconds)) moving = true;
    return moving;
  }

  function render(now: number): void {
    frameCount += 1;
    // Shadows from the breeze need refreshing, but not at full rate: the key's map every other frame, contact every fourth.
    renderer.shadowMap.needsUpdate = frameCount % 2 === 1 || reducedMotion;
    if (frameCount % 4 === 1 || reducedMotion) drawn.forEach((station) => station.shadow.update(renderer, scene));
    post.focus = camera.position.distanceTo(focusOf(active, focusPoint).setX(rig.target.x));
    post.bloomStrength = lights.bloom;
    post.exposure = lights.exposure;
    post.look.power = lights.lookPower;
    post.look.saturation = lights.lookSaturation;
    post.render(scene, camera, now / 1000);
  }

  function tick(now: number): void {
    frameId = 0;
    if (disposed) return;
    const seconds = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    const moving = step(seconds, now);
    render(now);
    if (!reducedMotion) quality.sample(seconds * 1000);
    if (moving) wake();
  }

  const onEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      lights.setHover(true);
      wake();
    }
  };
  const onLeave = () => {
    lights.setHover(false);
    wake();
  };
  const onInput = () => wake();
  canvas.addEventListener("pointerenter", onEnter);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointermove", onInput);
  canvas.addEventListener("wheel", onInput, { passive: true });
  const onContextLost = (event: Event) => {
    event.preventDefault();
    options.onContextLost?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const visibility = typeof IntersectionObserver === "undefined"
    ? null
    : new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      wake();
    });
  visibility?.observe(container);
  const onVisibilityChange = () => wake();
  document.addEventListener("visibilitychange", onVisibilityChange);

  applyTier(quality.tier);

  interface Preparation {
    done: Promise<void>;
    /** Finishes at once a bouquet still being built in slices. */
    hurry(): void;
  }
  const preparing: Partial<Record<IntroFlowerVariant, Preparation>> = {};
  let glbLoaded = false;

  function settle(variant: IntroFlowerVariant, root: THREE.Group): void {
    if (disposed) disposeIntroFlower(root);
    else attachSpecimen(stations[variant], root);
  }

  /**
   * Builds or loads a station's bouquet, once. Built in code, it is made at once, or with `sliced` a few milliseconds
   * at a time in the gaps between frames; asking again without `sliced` finishes it at once.
   */
  function prepare(variant: IntroFlowerVariant, sliced = false): Promise<void> {
    const existing = preparing[variant];
    if (existing) {
      if (!sliced) existing.hurry();
      return existing.done;
    }
    const source = sources[variant];
    if (source.source === "glb") {
      const done = import("./glbBouquet")
        .then((module) => {
          glbLoaded = true;
          return module.loadGlbBouquet(source.url, renderer);
        })
        .catch((error: unknown) => {
          console.warn(`The ${variant} bouquet could not be loaded from ${source.url}; showing the one built in code.`, error);
          return createIntroFlower(variant);
        })
        .then((root) => settle(variant, root));
      preparing[variant] = { done, hurry: () => undefined };
      return done;
    }
    const steps = introFlowerSteps(variant);
    let finished = false;
    let resolve: () => void = () => undefined;
    const done = new Promise<void>((settled) => {
      resolve = settled;
    });
    const run = (budget: number) => {
      const end = performance.now() + budget;
      while (!finished) {
        const step = steps.next();
        if (step.done) {
          finished = true;
          settle(variant, step.value);
          resolve();
        } else if (performance.now() >= end) {
          return;
        }
      }
    };
    const slice = (budget: number) => {
      if (finished) return;
      if (disposed) {
        finished = true;
        resolve();
        return;
      }
      run(budget);
      if (!finished) nextSlice(slice);
    };
    preparing[variant] = { done, hurry: () => run(Infinity) };
    if (sliced) nextSlice(slice);
    else run(Infinity);
    return done;
  }

  /**
   * Compiles a station's programs off the main thread where the browser can (it must be visible to be included; off
   * camera it costs nothing to draw): as the scene pass draws it, into the post's target, and as the shadow pass draws
   * it. In the `background`, it then does ahead of time, a little per quiet moment, what the first frames of a flight to
   * it would otherwise do: each new program's first use (three reads its logs and uniforms back from the GPU process, in
   * a round trip that waits for everything queued before it) and each texture's upload.
   */
  function warm(station: Station, background: boolean): Promise<void> {
    station.group.visible = true;
    const compiling = post.inScenePass(() => {
      if (station.root) compileShadowTwins(renderer, station.root, camera, scene);
      return typeof renderer.compileAsync === "function" ? renderer.compileAsync(scene, camera) : Promise.resolve();
    });
    return compiling.catch(() => undefined).then(() => new Promise<void>((resolve) => {
      if (disposed) return resolve();
      station.group.visible = drawn.has(station);
      const chores: Array<() => void> = [];
      if (background) {
        // Programs already in use answer at once; only the new ones make the round trip.
        for (const program of renderer.info.programs ?? []) chores.push(() => program.getUniforms());
        const textures = new Set<THREE.Texture>();
        station.root?.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
            for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
          }
        });
        for (const texture of textures) chores.push(() => renderer.initTexture(texture));
      }
      const run = (budget: number) => {
        const end = performance.now() + budget;
        while (!disposed && chores.length && performance.now() < end) chores.shift()?.();
        if (disposed || !chores.length) resolve();
        else nextSlice(run);
      };
      run(0);
    }));
  }

  // Everything still in flight. Disposal waits for it: three keeps polling the programs it is compiling, and releasing
  // them mid-way would pull them from under it.
  let work: Promise<unknown> = Promise.resolve();
  const track = (promise: Promise<unknown>) => {
    work = Promise.all([work, promise]);
    return promise;
  };
  let backgroundTimer = 0;
  const first = active;
  track(prepare(first.variant).then(() => warm(first, false)).then(() => {
    if (disposed) return;
    first.warmed = true;
    ready = true;
    last = performance.now();
    render(last);
    options.onReady?.();
    wake();
    // Once the loader has made way, the other bouquets are built in the background one after another, nearest first,
    // never more than a slice per frame.
    const others = row.filter((station) => station !== first).sort((a, b) => Math.abs(a.group.position.x - first.group.position.x) - Math.abs(b.group.position.x - first.group.position.x));
    backgroundTimer = window.setTimeout(() => {
      track((async () => {
        for (const other of others) {
          await prepare(other.variant, true);
          if (disposed) return;
          await warm(other, true);
          other.warmed = true;
        }
      })());
    }, 400);
  }));

  return {
    setVariant(variant) {
      const next = stations[variant];
      if (next === active || disposed) return;
      // Asked for before the idle hour came: build it now (a bouquet built in code is there before the next frame), and
      // compile it while the camera is on its way.
      if (!next.root) {
        track(prepare(variant).then(() => (disposed ? undefined : warm(next, false))).then(() => {
          next.warmed = true;
        }));
      }
      active = next;
      lights.setPreset(PRESET[variant], reducedMotion);
      lights.setFocus(focusOf(next), reducedMotion);
      if (reducedMotion) {
        rig.jumpTo(lookAt(next));
        show(new Set([next]));
      } else {
        // A plinth further along takes a little longer to reach.
        rig.flyTo(lookAt(next), 1.2 + 0.6 * (Math.abs(next.group.position.x - rig.target.x) / STATION_GAP));
        show(new Set([...drawn, next, ...row.filter((station) => station.warmed)]));
      }
      frameCount = 0;
      wake();
    },
    dispose() {
      disposed = true;
      window.clearTimeout(backgroundTimer);
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibility?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointermove", onInput);
      canvas.removeEventListener("wheel", onInput);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      rig.dispose();
      canvas.remove();
      void work.then(() => {
        post.dispose();
        row.forEach((station) => {
          station.shadow.dispose();
          station.disposables.forEach((item) => item.dispose());
          if (station.root) disposeIntroFlower(station.root);
        });
        if (glbLoaded) void import("./glbBouquet").then((module) => module.releaseGlbLoaders());
        dust.points.geometry.dispose();
        (dust.points.material as THREE.Material).dispose();
        dust.texture?.dispose();
        environment.dispose();
        lights.key.shadow.map?.dispose();
        renderer.dispose();
      });
    },
  };
}
