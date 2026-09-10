import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createIntroFlower, disposeIntroFlower, type IntroFlowerVariant } from "../model/introFlowers";
import { IntroFlowerFallback } from "./IntroFlowerFallback";

interface MemoryFlower3DProps {
  reducedMotion: boolean;
  variant?: IntroFlowerVariant;
}

export function MemoryFlower3D({ reducedMotion, variant = "sunflower" }: MemoryFlower3DProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const updateVariant = useRef<((next: IntroFlowerVariant) => void) | null>(null);
  const selectedVariant = useRef(variant);
  const [supported, setSupported] = useState(() => typeof WebGLRenderingContext !== "undefined");

  useEffect(() => {
    selectedVariant.current = variant;
    updateVariant.current?.(variant);
  }, [variant]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supported) return;
    let frameId = 0;
    let unsupportedTimer = 0;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      unsupportedTimer = window.setTimeout(() => setSupported(false), 0);
      return () => clearTimeout(unsupportedTimer);
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // A soft studio environment gives the petals real specular life without extra draw calls.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.34;
    pmrem.dispose();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 30);
    // Both keepsakes share one renderer. Changing parts never recreates the WebGL context.
    const flowers = { sunflower: createIntroFlower("sunflower"), hydrangea: createIntroFlower("hydrangea") };
    scene.add(flowers.sunflower, flowers.hydrangea);
    const ambient = new THREE.HemisphereLight(0xfff8f0, 0x152031, 1.15);
    const key = new THREE.DirectionalLight(0xfff3dd, 2.9);
    const lighting: Record<IntroFlowerVariant, { sky: number; ground: number; key: number; rim: number; fill: number; spot: number }> = {
      sunflower: { sky: 0xfff8f0, ground: 0x152031, key: 0xfff3dd, rim: 0xffc98a, fill: 0xf3f6ff, spot: 0xffecd2 },
      hydrangea: { sky: 0xeaf3ff, ground: 0x0e1f38, key: 0xf2f7ff, rim: 0x8fc3ff, fill: 0xc7dcff, spot: 0xdfefff },
    };
    key.position.set(-2.4, 4.8, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 14;
    key.shadow.normalBias = 0.018;
    // A backlight catches petal edges so the blooms separate from the dark room.
    const rim = new THREE.DirectionalLight(0xffc98a, 2.2);
    rim.position.set(2.6, 3, -2.2);
    const fill = new THREE.DirectionalLight(0xf3f6ff, 0.65);
    fill.position.set(2, 0.3, 4);
    // The museum spot: a soft-edged pool of light from above the case, pooling on the pedestal.
    const spot = new THREE.SpotLight(0xffecd2, 42, 0, 0.46, 0.8, 2);
    spot.position.set(0.5, 5.4, 3.4);
    spot.target.position.set(0, -0.3, 0);
    scene.add(ambient, key, rim, fill, spot, spot.target);

    let active = flowers[selectedVariant.current];
    let changedAt = performance.now();
    const applyVariant = (next: IntroFlowerVariant) => {
      active = flowers[next];
      flowers.sunflower.visible = next === "sunflower";
      flowers.hydrangea.visible = next === "hydrangea";
      const palette = lighting[next];
      ambient.color.setHex(palette.sky);
      ambient.groundColor.setHex(palette.ground);
      key.color.setHex(palette.key);
      rim.color.setHex(palette.rim);
      fill.color.setHex(palette.fill);
      spot.color.setHex(palette.spot);
      changedAt = performance.now();
      // Draw at once so the new keepsake shows even while animation frames are paused.
      renderer.render(scene, camera);
    };
    updateVariant.current = applyVariant;
    applyVariant(selectedVariant.current);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.set(0, 0.24, camera.aspect < 0.78 ? 5.75 : 5.3);
      camera.lookAt(0, 0.1, 0);
      camera.updateProjectionMatrix();
      Object.values(flowers).forEach((flower) => flower.scale.setScalar(camera.aspect < 0.78 ? 0.82 : 0.9));
      renderer.render(scene, camera);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const render = (time: number) => {
      if (!document.hidden) {
        const bouquet = active.getObjectByName("bouquet");
        if (bouquet && !reducedMotion) {
          const entrance = 1 - Math.pow(1 - Math.min(1, (time - changedAt) / 900), 3);
          // The newly chosen bouquet turns into place, then keeps a slow sway.
          bouquet.rotation.y = Math.sin(time * 0.00035) * 0.055 + (1 - entrance) * 0.55;
          bouquet.scale.setScalar(0.94 + entrance * 0.06);
          bouquet.position.y = (1 - entrance) * -0.03;
        }
        renderer.render(scene, camera);
      }
      if (!reducedMotion) frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);
    const contextLost = (event: Event) => { event.preventDefault(); setSupported(false); };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);

    return () => {
      updateVariant.current = null;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      Object.values(flowers).forEach(disposeIntroFlower);
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reducedMotion, supported]);

  return (
    <span className={`memory-flower-3d ${supported ? "" : "is-fallback"}`} data-flower-variant={variant} ref={containerRef} aria-hidden="true">
      {!supported ? <IntroFlowerFallback variant={variant} /> : null}
    </span>
  );
}
