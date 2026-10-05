import * as THREE from "three";
import { createIntroFlower, disposeIntroFlower, type IntroFlowerVariant } from "../../model/introFlowers";
import { AdaptiveQuality, startingTier, tierSettings, type QualityTier } from "./adaptiveQuality";
import { CameraRig, type RigLimits, type RigPose } from "./cameraRig";
import { ContactShadow } from "./contactShadow";
import { StudioLights, createStudioEnvironment, type LightPresetName } from "./lighting";
import { plantWind } from "./plantMaterial";
import { BouquetPost } from "./postprocessing";

const PRESET: Record<IntroFlowerVariant, LightPresetName> = { sunflower: "golden", hydrangea: "moonlight" };
/** The plinths stand far enough apart that only one is ever in frame at rest; switching is a dolly between them. */
const STATION_X: Record<IntroFlowerVariant, number> = { sunflower: -3.6, hydrangea: 3.6 };
/** Lacquered dark stone with a fine metal inlay: brass under the sunflowers, silver under the hydrangeas. */
const PLINTH: Record<IntroFlowerVariant, { stone: number; inlay: number }> = {
  sunflower: { stone: 0x0d0c0f, inlay: 0xb2925f },
  hydrangea: { stone: 0x0a0f17, inlay: 0x9aa9ba },
};
/** Bouquet-space height of the plinth's top, where the wrap stands. */
const PLINTH_TOP = -1.16;
const LOOK_HEIGHT = 0.1;

export interface BouquetStageOptions {
  variant: IntroFlowerVariant;
  reducedMotion: boolean;
  /** windStrength: tip travel in bouquet units; windSpeed: how quickly gusts come and go. */
  wind?: { strength?: number; speed?: number };
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
  root: THREE.Group;
  bouquet: THREE.Object3D;
  shadow: ContactShadow;
  idlePhase: number;
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

function buildStation(variant: IntroFlowerVariant): Station {
  const group = new THREE.Group();
  group.name = `station-${variant}`;
  group.position.x = STATION_X[variant];
  const specimen = new THREE.Group();
  const root = createIntroFlower(variant);
  const bouquet = root.getObjectByName("bouquet") ?? root;
  ContactShadow.cast(root);
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
  specimen.add(stone, inlay, shadow.group, root);
  group.add(specimen);
  return { variant, group, specimen, root, bouquet, shadow, idlePhase: 0, disposables: [stoneGeometry, stoneMaterial, inlayGeometry, inlayMaterial] };
}

/** Dust hanging in the light: a few dozen soft points spread across both plinths, so a camera move reads as one. */
function buildDust(): { points: THREE.Points; speeds: Float32Array; texture: THREE.Texture | null } {
  const count = 70;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const random = (salt: number) => {
      const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };
    positions[index * 3] = -6.5 + random(1) * 13;
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
 * The cabinet both keepsakes stand in: one transparent canvas over the HTML room, both bouquets on their own plinths in
 * one scene, lit for the part on show. Switching parts flies the camera to the other plinth while the light turns from
 * golden hour to moonlight. The visitor can turn and zoom within limits; left alone, the bouquet turns slowly on its own
 * and the view drifts back to its best side. Drawing stops whenever the cabinet is off screen or the tab is hidden.
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

  const stations: Record<IntroFlowerVariant, Station> = { sunflower: buildStation("sunflower"), hydrangea: buildStation("hydrangea") };
  Object.values(stations).forEach((station) => scene.add(station.group));
  let active = stations[options.variant];
  let leaving: Station | null = null;

  const lights = new StudioLights(scene, PRESET[options.variant]);
  lights.key.shadow.radius = 4;
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
    Object.values(stations).forEach((station) => station.specimen.scale.setScalar(next.scale));
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
    if (wasFlying && !rig.flying && leaving) {
      leaving.group.visible = false;
      leaving = null;
    }
    if (!reducedMotion) {
      // Left alone, the bouquet turns slowly back and forth; a hand on it stops the turn where it is.
      const resting = !rig.dragging && !rig.flying && rig.idleSeconds(now) > 3.5;
      idleWeight += ((resting ? 1 : 0) - idleWeight) * (1 - Math.exp(-seconds * 1.5));
      active.idlePhase += seconds * idleWeight * ((Math.PI * 2) / 30);
      active.bouquet.rotation.y = 0.42 * Math.sin(active.idlePhase);
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
    if (frameCount % 4 === 1 || reducedMotion) {
      active.shadow.update(renderer, scene);
      leaving?.shadow.update(renderer, scene);
    }
    post.focus = camera.position.distanceTo(focusOf(active, focusPoint).setX(rig.target.x));
    post.bloomStrength = lights.bloom;
    post.exposure = lights.exposure;
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
  // Compile every program before the first frame (both plinths visible, so the second never stalls a flight), then show.
  stations.sunflower.group.visible = true;
  stations.hydrangea.group.visible = true;
  const compiled: Promise<unknown> = (typeof renderer.compileAsync === "function" ? renderer.compileAsync(scene, camera) : Promise.resolve()).catch(() => undefined);
  void compiled.then(() => {
    if (disposed) return;
    Object.values(stations).forEach((station) => { station.group.visible = station === active; });
    ready = true;
    last = performance.now();
    render(last);
    options.onReady?.();
    wake();
  });

  return {
    setVariant(variant) {
      const next = stations[variant];
      if (next === active || disposed) return;
      const previous = active;
      active = next;
      next.group.visible = true;
      lights.setPreset(PRESET[variant], reducedMotion);
      lights.setFocus(focusOf(next), reducedMotion);
      if (reducedMotion) {
        rig.jumpTo(lookAt(next));
        previous.group.visible = false;
        leaving = null;
      } else {
        leaving = previous;
        rig.flyTo(lookAt(next));
      }
      frameCount = 0;
      wake();
    },
    dispose() {
      disposed = true;
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
      // three keeps polling the programs it is compiling; releasing them mid-way would pull them from under it.
      void compiled.then(() => {
        post.dispose();
        Object.values(stations).forEach((station) => {
          station.shadow.dispose();
          station.disposables.forEach((item) => item.dispose());
          disposeIntroFlower(station.root);
        });
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
