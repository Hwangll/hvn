import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { KeepsakeId } from "../model/keepsakes";

export type KeepsakeTheme = "blush" | "night";

interface UseThreeKeepsakesOptions {
  reducedMotion: boolean;
  selectedId: KeepsakeId;
  unlockedIds: KeepsakeId[];
  onSelect: (id: KeepsakeId) => void;
  /** Part I opens a blush keepsake box; Part II shows the same box under a blue-hour light. */
  theme?: KeepsakeTheme;
}

interface ScenePalette {
  background: number;
  sky: number;
  ground: number;
  key: number;
  accentLight: number;
  floor: number;
  wall: number;
  arch: number;
  petal: number;
  petalCenter: number;
  sparkles: number[];
}

const scenePalettes: Record<KeepsakeTheme, ScenePalette> = {
  blush: {
    background: 0xffedf5, sky: 0xffffff, ground: 0xff9fbd, key: 0xffffff, accentLight: 0xff7dab,
    floor: 0xffd5e3, wall: 0xffe9f2, arch: 0xff9fbd, petal: 0xffa8c7, petalCenter: 0xffd84f,
    sparkles: [0xff4f93, 0xffa8c7, 0xffd84f, 0xffffff],
  },
  night: {
    background: 0x0b1e38, sky: 0xdfe9ff, ground: 0x143458, key: 0xeaf2ff, accentLight: 0x8bcbd8,
    floor: 0x0f2846, wall: 0x0d2540, arch: 0x8bcbd8, petal: 0x9fd3ea, petalCenter: 0xfff4cc,
    sparkles: [0xa8ddeb, 0xdcecf7, 0xfff4cc, 0xffffff],
  },
};

interface KeepsakeObject extends THREE.Group {
  userData: {
    id: KeepsakeId;
    baseY: number;
    baseRotation: [number, number, number];
    baseScale: number;
    spin: number;
  };
}

const keepsakeColors = {
  pink: 0xff4f93,
  pinkSoft: 0xffa8c7,
  pinkPale: 0xffeef4,
  rose: 0xd94976,
  cream: 0xfff3df,
  butter: 0xffd84f,
  leaf: 0x55b96d,
  blue: 0x62bfff,
  ink: 0x5a2940,
  blush: 0xffd5e3,
  shadow: 0xd36b96,
};

export function useThreeKeepsakes({ reducedMotion, selectedId, unlockedIds, onSelect, theme = "blush" }: UseThreeKeepsakesOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef(selectedId);
  const unlockedIdsRef = useRef(unlockedIds);
  const onSelectRef = useRef(onSelect);
  const [supported, setSupported] = useState(() => typeof WebGLRenderingContext !== "undefined");

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    unlockedIdsRef.current = unlockedIds;
  }, [unlockedIds]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    if (reducedMotion || !supported) {
      return undefined;
    }

    let unsupportedTimer = 0;

    const palette = scenePalettes[theme];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.background);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 2.55, 6.25);
    camera.lookAt(0, 0.15, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    } catch {
      unsupportedTimer = window.setTimeout(() => setSupported(false), 0);
      return () => window.clearTimeout(unsupportedTimer);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.HemisphereLight(palette.sky, palette.ground, theme === "night" ? 2.4 : 3.4);
    const keyLight = new THREE.DirectionalLight(palette.key, theme === "night" ? 3 : 3.4);
    keyLight.position.set(2.8, 5.4, 3.6);
    keyLight.castShadow = true;
    const blushLight = new THREE.PointLight(palette.accentLight, theme === "night" ? 3.2 : 2.6, 14);
    blushLight.position.set(-3, 2.2, 2.8);
    scene.add(ambientLight, keyLight, blushLight);

    const backdrop = makeBackdrop(palette);
    scene.add(backdrop);

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(3.25, 3.75, 0.24, 80),
      new THREE.MeshPhysicalMaterial({ color: palette.floor, roughness: theme === "night" ? 0.42 : 0.72, clearcoat: theme === "night" ? 0.6 : 0.18, clearcoatRoughness: theme === "night" ? 0.3 : 0.65 }),
    );
    floor.position.y = -1.05;
    floor.receiveShadow = true;
    scene.add(floor);
    scene.add(makeDeskDetails(palette));

    const keepsakeObjects = createKeepsakes();
    const displayGroup = new THREE.Group();
    displayGroup.scale.setScalar(1.12);
    keepsakeObjects.forEach((object) => displayGroup.add(object));
    const selectionSparkles = makeSelectionSparkles(palette.sparkles);
    displayGroup.add(selectionSparkles);
    scene.add(displayGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(9, 9);
    let hovered: KeepsakeObject | null = null;
    let frameId = 0;
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height, false);
      const aspect = width / height || 1;
      const isNarrow = aspect < 0.86;
      camera.aspect = aspect;
      camera.position.y = isNarrow ? 2.72 : 2.55;
      camera.position.z = isNarrow ? 7.15 : 6.25;
      displayGroup.scale.setScalar(isNarrow ? 0.84 : aspect < 1.08 ? 1 : 1.12);
      camera.updateProjectionMatrix();
    };

    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (event: PointerEvent) => {
      setPointer(event);
    };

    const onPointerLeave = () => {
      pointer.set(9, 9);
      renderer.domElement.style.cursor = "grab";
    };

    const onPointerDown = (event: PointerEvent) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const visibleKeepsakes = keepsakeObjects.filter((object) => object.visible);
      const hit = findKeepsake(raycaster.intersectObjects(visibleKeepsakes, true)[0]?.object);
      if (hit) {
        onSelectRef.current(hit.userData.id);
      }
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const animate = (time: number) => {
      const elapsed = time * 0.001;
      raycaster.setFromCamera(pointer, camera);
      const visibleKeepsakes = keepsakeObjects.filter((object) => object.visible);
      hovered = findKeepsake(raycaster.intersectObjects(visibleKeepsakes, true)[0]?.object);
      renderer.domElement.style.cursor = hovered ? "pointer" : "grab";

      keepsakeObjects.forEach((object, index) => {
        const isUnlocked = unlockedIdsRef.current.includes(object.userData.id);
        const isSelected = object.userData.id === selectedRef.current;
        const isHovered = hovered === object;
        const targetScale = object.userData.baseScale * (isSelected ? 1.22 : isHovered ? 1.1 : 1);
        const [baseRotationX, baseRotationY, baseRotationZ] = object.userData.baseRotation;
        object.visible = isUnlocked || object.scale.x > 0.035;
        object.scale.lerp(new THREE.Vector3(isUnlocked ? targetScale : 0.01, isUnlocked ? targetScale : 0.01, isUnlocked ? targetScale : 0.01), 0.08);
        object.rotation.x = baseRotationX + Math.sin(elapsed * 0.85 + index) * 0.022;
        object.rotation.y = baseRotationY + Math.sin(elapsed * 0.95 + index * 0.8) * object.userData.spin * (isSelected ? 22 : 14);
        object.rotation.z = baseRotationZ + Math.sin(elapsed * 0.75 + index * 0.6) * 0.018;
        object.position.y = object.userData.baseY + Math.sin(elapsed * 1.4 + index) * 0.08 + (isSelected ? 0.18 : 0);
      });

      const selectedObject = keepsakeObjects.find((object) => object.userData.id === selectedRef.current && object.visible);
      if (selectedObject) {
        selectionSparkles.visible = true;
        selectionSparkles.position.lerp(
          new THREE.Vector3(selectedObject.position.x, selectedObject.position.y + 0.24, selectedObject.position.z + 0.08),
          0.12,
        );
        selectionSparkles.children.forEach((child) => {
          const { drift, offset, radius, speed } = child.userData as { drift: number; offset: number; radius: number; speed: number };
          const angle = elapsed * speed + offset;
          child.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.35) * 0.18 + drift, Math.sin(angle) * radius * 0.5);
          child.rotation.set(elapsed * 0.7 + offset, elapsed * speed, angle);
        });
      } else {
        selectionSparkles.visible = false;
      }

      camera.position.x = Math.sin(elapsed * 0.18) * 0.28;
      camera.lookAt(0, 0.1, 0);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(unsupportedTimer);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      keepsakeObjects.forEach((object) => {
        displayGroup.remove(object);
        disposeObject(object);
      });
      displayGroup.remove(selectionSparkles);
      disposeObject(selectionSparkles);
      scene.remove(displayGroup);
      scene.remove(backdrop);
      disposeObject(backdrop);
      floor.geometry.dispose();
      const floorMaterial = floor.material;
      if (Array.isArray(floorMaterial)) {
        floorMaterial.forEach((item) => item.dispose());
      } else {
        floorMaterial.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reducedMotion, supported, theme]);

  return { containerRef, supported: supported && !reducedMotion };
}

function createKeepsakes(): KeepsakeObject[] {
  return [
    makeBouquet(-1.8, 0.18, -0.15),
    makeEnvelope(-1.15, -0.3, 0.68),
    makeHeart(-0.42, 0.08, -0.5),
    makeCandle(0.32, -0.34, 0.22),
    makePolaroid(1.05, -0.1, 0.7),
    makeStar(1.82, 0.45, 0.2),
    makePairFrame(-1.62, 0.2, -1.12),
    makeDateCard(-0.82, -0.25, -1.05),
    makeAquariumTicket(0, 0.24, -1.08),
    makeCafeCup(0.86, -0.26, -1.02),
    makeSunsetPhoto(1.66, 0.16, -1.08),
  ];
}

function makeBackdrop(palette: ScenePalette): THREE.Group {
  const group = new THREE.Group();
  const wall = makeMesh(
    "star",
    new THREE.BoxGeometry(7.5, 4.2, 0.12),
    new THREE.MeshBasicMaterial({ color: palette.wall }),
    [0, 1.05, -2.15],
  );
  wall.receiveShadow = true;
  group.add(wall);

  const arch = makeMesh(
    "star",
    new THREE.TorusGeometry(1.9, 0.03, 10, 80, Math.PI),
    new THREE.MeshBasicMaterial({ color: palette.arch }),
    [0.05, 0.65, -2.05],
  );
  arch.rotation.z = Math.PI;
  group.add(arch);

  for (let i = 0; i < 12; i += 1) {
    const flower = makeFlower("star", makePhysical(palette.petal, 0.62), makePhysical(palette.petalCenter, 0.5), 0.07);
    const angle = (i / 12) * Math.PI * 2;
    flower.position.set(Math.cos(angle) * 2.6, 1.25 + Math.sin(angle * 1.7) * 0.45, -1.98);
    flower.rotation.z = angle;
    group.add(flower);
  }
  return group;
}

function makeDeskDetails(palette: ScenePalette): THREE.Group {
  const group = new THREE.Group();
  const paperMaterial = makePhysical(0xfffbf2, 0.78);
  const tapeMaterial = makePhysical(0xffd84f, 0.55);
  const smallPapers: Array<[number, number, number, number]> = [
    [-2.15, -0.91, 0.72, -0.3],
    [-0.95, -0.9, -0.85, 0.18],
    [1.55, -0.9, 0.75, 0.25],
  ];

  smallPapers.forEach(([x, y, z, rotation]) => {
    const paper = makeMesh("star", new THREE.BoxGeometry(0.68, 0.46, 0.025), paperMaterial, [x, y, z]);
    paper.rotation.set(-Math.PI / 2, 0, rotation);
    group.add(paper);
    const tape = makeMesh("star", new THREE.BoxGeometry(0.28, 0.08, 0.03), tapeMaterial, [x + 0.16, y + 0.03, z + 0.08]);
    tape.rotation.set(-Math.PI / 2, 0, rotation + 0.16);
    group.add(tape);
  });

  for (let i = 0; i < 10; i += 1) {
    const petal = makeMesh(
      "star",
      new THREE.SphereGeometry(0.055, 12, 8),
      makePhysical(i % 2 === 0 ? palette.sparkles[0] : palette.petal, 0.5),
      [-2.2 + i * 0.46, -0.82, -0.78 + Math.sin(i) * 0.12],
    );
    petal.scale.set(1, 0.48, 0.16);
    petal.rotation.set(Math.PI / 2, 0, i * 0.37);
    group.add(petal);
  }

  return group;
}

function makeSelectionSparkles(sparkleColors: number[]): THREE.Group {
  const group = new THREE.Group();
  group.visible = false;

  for (let i = 0; i < 22; i += 1) {
    const isPetal = i % 3 !== 0;
    const geometry = new THREE.SphereGeometry(isPetal ? 0.04 : 0.026, 10, 6);
    const material = new THREE.MeshBasicMaterial({
      color: sparkleColors[i % sparkleColors.length],
      transparent: true,
      opacity: isPetal ? 0.72 : 0.92,
    });
    const sparkle = new THREE.Mesh(geometry, material);
    sparkle.castShadow = false;
    sparkle.receiveShadow = false;
    sparkle.scale.set(isPetal ? 1.45 : 1, isPetal ? 0.62 : 1, 0.24);
    sparkle.userData = {
      drift: -0.02 + (i % 5) * 0.035,
      offset: i * 0.67,
      radius: 0.58 + (i % 4) * 0.08,
      speed: 0.72 + (i % 6) * 0.08,
    };
    group.add(sparkle);
  }

  return group;
}

function makeGroup(id: KeepsakeId, position: [number, number, number], spin: number, baseScale = 1): KeepsakeObject {
  const group = new THREE.Group() as KeepsakeObject;
  group.position.set(...position);
  group.scale.setScalar(0.01);
  group.userData = { id, baseY: position[1], baseRotation: [0, 0, 0], baseScale, spin };
  return group;
}

function setRestingRotation(group: KeepsakeObject, rotation: [number, number, number]): void {
  group.rotation.set(...rotation);
  group.userData.baseRotation = rotation;
}

function makeMesh<T extends THREE.BufferGeometry>(
  id: KeepsakeId,
  geometry: T,
  material: THREE.Material,
  position: [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.userData = { id };
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makePhysical(color: number, roughness: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    clearcoat: 0.28,
    clearcoatRoughness: 0.56,
    specularIntensity: 0.5,
  });
}

function makeRoundedMesh(
  id: KeepsakeId,
  width: number,
  height: number,
  radius: number,
  depth: number,
  material: THREE.Material,
  position: [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: Math.min(radius * 0.45, depth * 0.48),
    bevelThickness: Math.min(radius * 0.28, depth * 0.42),
    curveSegments: 12,
    depth,
  });
  geometry.center();
  return makeMesh(id, geometry, material, position);
}

function makeHeartToken(id: KeepsakeId, scale: number, color: number, position: [number, number, number]): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.42 * scale);
  shape.bezierCurveTo(0, 0.72 * scale, -0.52 * scale, 0.82 * scale, -0.62 * scale, 0.28 * scale);
  shape.bezierCurveTo(-0.72 * scale, -0.24 * scale, -0.08 * scale, -0.55 * scale, 0, -0.76 * scale);
  shape.bezierCurveTo(0.08 * scale, -0.55 * scale, 0.72 * scale, -0.24 * scale, 0.62 * scale, 0.28 * scale);
  shape.bezierCurveTo(0.52 * scale, 0.82 * scale, 0, 0.72 * scale, 0, 0.42 * scale);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: scale * 0.025,
    bevelThickness: scale * 0.025,
    depth: scale * 0.1,
  });
  geometry.center();
  return makeMesh(id, geometry, makePhysical(color, 0.4), position);
}

function addSelectionHalo(group: KeepsakeObject, id: KeepsakeId): void {
  const halo = makeMesh(
    id,
    new THREE.CylinderGeometry(0.58, 0.72, 0.018, 56),
    new THREE.MeshBasicMaterial({ color: 0xff7dab, transparent: true, opacity: 0.22 }),
    [0, -0.82, 0],
  );
  halo.userData = { id, isHalo: true };
  group.add(halo);
}

function makeBouquet(x: number, y: number, z: number): KeepsakeObject {
  const group = makeGroup("bouquet", [x, y, z], 0.006);
  addSelectionHalo(group, "bouquet");
  const stemMaterial = makePhysical(keepsakeColors.leaf, 0.64);
  const petalMaterials = [
    makePhysical(keepsakeColors.pink, 0.46),
    makePhysical(keepsakeColors.pinkSoft, 0.5),
    makePhysical(keepsakeColors.blue, 0.52),
  ];
  const centerMaterial = makePhysical(keepsakeColors.butter, 0.42);

  for (let i = 0; i < 5; i += 1) {
    const stem = makeMesh("bouquet", new THREE.CylinderGeometry(0.025, 0.035, 1.35, 10), stemMaterial, [
      -0.28 + i * 0.14,
      -0.38,
      -0.04 + (i % 2) * 0.06,
    ]);
    stem.rotation.z = -0.3 + i * 0.15;
    group.add(stem);

    const flower = makeFlower("bouquet", petalMaterials[i % petalMaterials.length], centerMaterial, 0.22 + i * 0.015);
    flower.position.set(-0.42 + i * 0.22, 0.24 + Math.sin(i) * 0.12, -0.08 + (i % 2) * 0.14);
    flower.rotation.set(0.2, -0.2 + i * 0.1, -0.1 + i * 0.08);
    group.add(flower);
  }

  const leafMaterial = makePhysical(0x65c879, 0.62);
  for (let i = 0; i < 4; i += 1) {
    const leaf = makeMesh("bouquet", new THREE.SphereGeometry(0.12, 14, 8), leafMaterial, [-0.22 + i * 0.16, -0.22 - i * 0.04, 0.04]);
    leaf.scale.set(1.25, 0.42, 0.14);
    leaf.rotation.set(0.2, 0.2, -0.8 + i * 0.42);
    group.add(leaf);
  }

  const wrap = makeMesh(
    "bouquet",
    new THREE.ConeGeometry(0.56, 0.86, 4),
    makePhysical(keepsakeColors.cream, 0.78),
    [0, -0.7, 0],
  );
  wrap.rotation.set(0.78, 0.18, Math.PI / 4);
  group.add(wrap);
  setRestingRotation(group, [-0.08, 0.28, -0.12]);
  return group;
}

function makeEnvelope(x: number, y: number, z: number): KeepsakeObject {
  const group = makeGroup("envelope", [x, y, z], 0.005, 0.86);
  addSelectionHalo(group, "envelope");
  const paper = makePhysical(0xfffbf1, 0.68);
  paper.side = THREE.DoubleSide;
  const flap = makePhysical(0xffdce8, 0.64);
  flap.side = THREE.DoubleSide;
  const pocket = makePhysical(0xffedf4, 0.68);
  pocket.side = THREE.DoubleSide;
  const crease = makePhysical(0xff7cac, 0.54);

  const body = makeRoundedMesh("envelope", 1.12, 0.72, 0.035, 0.07, paper);
  group.add(body);

  const topFlap = makeTriangle("envelope", 1.02, 0.34, flap, [0, 0.31, 0.105]);
  topFlap.rotation.z = Math.PI;
  group.add(topFlap);

  const frontPocket = makeTriangle("envelope", 1.04, 0.44, pocket, [0, -0.11, 0.13]);
  group.add(frontPocket);

  const letterPeek = makeRoundedMesh("envelope", 0.72, 0.34, 0.025, 0.035, makePhysical(0xfffdf8, 0.56), [0, 0.33, 0.115]);
  letterPeek.rotation.z = -0.04;
  group.add(letterPeek);

  const letterLineOne = makeMesh("envelope", new THREE.BoxGeometry(0.38, 0.024, 0.018), makePhysical(0xff9fbd, 0.52), [-0.03, 0.37, 0.15]);
  const letterLineTwo = makeMesh("envelope", new THREE.BoxGeometry(0.28, 0.022, 0.018), makePhysical(0xffbfd1, 0.55), [-0.02, 0.3, 0.15]);
  group.add(letterLineOne, letterLineTwo);

  const leftCrease = makeCrease("envelope", 0.48, crease, [-0.24, -0.1, 0.16], -0.66);
  const rightCrease = makeCrease("envelope", 0.48, crease, [0.24, -0.1, 0.16], 0.66);
  group.add(leftCrease, rightCrease);

  const seal = makeMesh("envelope", new THREE.CylinderGeometry(0.105, 0.105, 0.035, 32), new THREE.MeshStandardMaterial({ color: keepsakeColors.rose, roughness: 0.42 }), [0, -0.08, 0.19]);
  seal.rotation.x = Math.PI / 2;
  group.add(seal);

  const sealHeart = makeHeartToken("envelope", 0.06, 0xfff1f7, [0, -0.077, 0.22]);
  group.add(sealHeart);

  const stamp = makeRoundedMesh("envelope", 0.18, 0.16, 0.02, 0.018, makePhysical(0xffb6cf, 0.5), [0.35, 0.13, 0.16]);
  stamp.rotation.z = 0.08;
  group.add(stamp);

  setRestingRotation(group, [-0.04, 0.12, -0.1]);
  return group;
}

function makeHeart(x: number, y: number, z: number): KeepsakeObject {
  const group = makeGroup("heart", [x, y, z], 0.009, 0.78);
  addSelectionHalo(group, "heart");
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.42);
  shape.bezierCurveTo(0, 0.72, -0.52, 0.82, -0.62, 0.28);
  shape.bezierCurveTo(-0.72, -0.24, -0.08, -0.55, 0, -0.76);
  shape.bezierCurveTo(0.08, -0.55, 0.72, -0.24, 0.62, 0.28);
  shape.bezierCurveTo(0.52, 0.82, 0, 0.72, 0, 0.42);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035 });
  const material = makePhysical(keepsakeColors.rose, 0.38);
  const mesh = makeMesh("heart", geometry, material);
  mesh.rotation.set(0.18, -0.1, 0.06);
  group.add(mesh);
  const shine = makeMesh("heart", new THREE.SphereGeometry(0.08, 16, 10), makePhysical(0xffffff, 0.22), [-0.2, 0.28, 0.16]);
  shine.scale.set(1, 0.55, 0.18);
  group.add(shine);
  return group;
}

function makeCandle(x: number, y: number, z: number): KeepsakeObject {
  const group = makeGroup("candle", [x, y, z], 0.004, 0.94);
  addSelectionHalo(group, "candle");
  const glass = makeMesh(
    "candle",
    new THREE.CylinderGeometry(0.42, 0.46, 1.2, 48, 1, true),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, transparent: true, opacity: 0.28, transmission: 0.2, clearcoat: 0.7 }),
  );
  group.add(glass);
  const wax = makeMesh("candle", new THREE.CylinderGeometry(0.34, 0.4, 1.08, 44), makePhysical(keepsakeColors.pinkPale, 0.62));
  group.add(wax);
  const label = makeMesh("candle", new THREE.BoxGeometry(0.5, 0.2, 0.035), makePhysical(keepsakeColors.pinkSoft, 0.54), [0, -0.05, 0.36]);
  group.add(label);
  const wick = makeMesh("candle", new THREE.CylinderGeometry(0.018, 0.018, 0.22, 10), makePhysical(keepsakeColors.ink, 0.5), [0, 0.64, 0]);
  group.add(wick);
  const flame = makeMesh("candle", new THREE.SphereGeometry(0.16, 18, 12), new THREE.MeshStandardMaterial({ color: keepsakeColors.butter, emissive: keepsakeColors.butter, emissiveIntensity: 1.6, roughness: 0.18 }), [0, 0.86, 0]);
  flame.scale.set(0.72, 1.25, 0.72);
  group.add(flame);
  setRestingRotation(group, [0.03, 0.3, -0.04]);
  return group;
}

function makePolaroid(x: number, y: number, z: number): KeepsakeObject {
  const group = makeGroup("polaroid", [x, y, z], 0.0065, 0.82);
  addSelectionHalo(group, "polaroid");
  const frame = makeRoundedMesh("polaroid", 0.92, 1.16, 0.055, 0.09, makePhysical(0xfffdf8, 0.5));
  group.add(frame);

  const photoMat = makePhysical(0xffd6e5, 0.52);
  const photo = makeRoundedMesh("polaroid", 0.74, 0.68, 0.035, 0.035, photoMat, [0, 0.2, 0.075]);
  group.add(photo);

  const sky = makeRoundedMesh("polaroid", 0.66, 0.28, 0.018, 0.018, makePhysical(0x9dd9ff, 0.5), [0, 0.36, 0.115]);
  const hill = makeRoundedMesh("polaroid", 0.66, 0.24, 0.02, 0.018, makePhysical(0xb9e9ad, 0.56), [0, 0.1, 0.12]);
  const path = makeMesh("polaroid", new THREE.BoxGeometry(0.12, 0.42, 0.018), makePhysical(0xfff4cf, 0.58), [0.04, 0.11, 0.145]);
  path.rotation.z = -0.12;
  const sun = makeMesh("polaroid", new THREE.SphereGeometry(0.055, 14, 8), makePhysical(0xffe98d, 0.42), [-0.22, 0.39, 0.15]);
  group.add(sky, hill, path, sun);

  const tinyBloomOne = makeFlower("polaroid", makePhysical(keepsakeColors.pink, 0.45), makePhysical(keepsakeColors.butter, 0.42), 0.055);
  tinyBloomOne.position.set(0.2, 0.16, 0.16);
  const tinyBloomTwo = makeFlower("polaroid", makePhysical(keepsakeColors.pinkSoft, 0.48), makePhysical(keepsakeColors.butter, 0.42), 0.048);
  tinyBloomTwo.position.set(0.31, 0.12, 0.16);
  group.add(tinyBloomOne, tinyBloomTwo);

  const tinyHeart = makeHeartToken("polaroid", 0.08, keepsakeColors.rose, [-0.16, 0.14, 0.16]);
  tinyHeart.rotation.z = -0.08;
  group.add(tinyHeart);

  const captionLine = makeRoundedMesh("polaroid", 0.48, 0.034, 0.017, 0.018, makePhysical(0xf07da6, 0.55), [0, -0.37, 0.12]);
  const captionDot = makeMesh("polaroid", new THREE.SphereGeometry(0.025, 10, 6), makePhysical(keepsakeColors.pinkSoft, 0.52), [-0.29, -0.37, 0.13]);
  group.add(captionLine, captionDot);

  const tapeTop = makeRoundedMesh("polaroid", 0.48, 0.16, 0.025, 0.045, makePhysical(0xffe98d, 0.5), [0.24, 0.75, 0.13]);
  tapeTop.rotation.z = 0.15;
  const tapeSide = makeRoundedMesh("polaroid", 0.14, 0.36, 0.025, 0.045, makePhysical(0xffefaa, 0.5), [0.48, 0.04, 0.13]);
  tapeSide.rotation.z = -0.06;
  group.add(tapeTop, tapeSide);

  setRestingRotation(group, [-0.03, -0.18, -0.08]);
  return group;
}

function makeStar(x: number, y: number, z: number): KeepsakeObject {
  const group = makeGroup("star", [x, y, z], 0.01);
  addSelectionHalo(group, "star");
  const shape = new THREE.Shape();
  const spikes = 5;
  const outer = 0.46;
  const inner = 0.2;
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const pointX = Math.cos(angle) * radius;
    const pointY = Math.sin(angle) * radius;
    if (i === 0) {
      shape.moveTo(pointX, pointY);
    } else {
      shape.lineTo(pointX, pointY);
    }
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025 });
  const material = makePhysical(keepsakeColors.butter, 0.38);
  const mesh = makeMesh("star", geometry, material);
  mesh.rotation.set(0.08, -0.2, 0.2);
  group.add(mesh);
  const sparkle = makeMesh("star", new THREE.SphereGeometry(0.08, 14, 8), makePhysical(0xffffff, 0.2), [-0.08, 0.1, 0.15]);
  sparkle.scale.set(1, 0.55, 0.25);
  group.add(sparkle);
  return group;
}

function makePairFrame(x: number, y: number, z: number): KeepsakeObject {
  const id: KeepsakeId = "pair-frame";
  const group = makeGroup(id, [x, y, z], 0.005, 0.72);
  addSelectionHalo(group, id);
  const frame = makeRoundedMesh(id, 1.25, 0.86, 0.07, 0.11, makePhysical(0xfff4df, 0.54));
  const leftPhoto = makeRoundedMesh(id, 0.46, 0.58, 0.04, 0.035, makePhysical(0xffbed4, 0.52), [-0.28, 0.03, 0.1]);
  const rightPhoto = makeRoundedMesh(id, 0.46, 0.58, 0.04, 0.035, makePhysical(0xafdfff, 0.52), [0.28, 0.03, 0.1]);
  group.add(frame, leftPhoto, rightPhoto);
  setRestingRotation(group, [-0.05, 0.18, -0.08]);
  return group;
}

function makeDateCard(x: number, y: number, z: number): KeepsakeObject {
  const id: KeepsakeId = "date-card";
  const group = makeGroup(id, [x, y, z], 0.004, 0.72);
  addSelectionHalo(group, id);
  const card = makeRoundedMesh(id, 0.98, 0.92, 0.07, 0.08, makePhysical(0xfffbef, 0.62));
  const header = makeRoundedMesh(id, 0.82, 0.2, 0.04, 0.025, makePhysical(0xff9fbd, 0.5), [0, 0.28, 0.08]);
  group.add(card, header);
  for (let index = 0; index < 3; index += 1) {
    const dot = makeMesh(id, new THREE.SphereGeometry(0.055, 12, 8), makePhysical(index === 1 ? 0xff7dab : 0xffd5e3, 0.5), [-0.25 + index * 0.25, -0.06, 0.1]);
    group.add(dot);
  }
  setRestingRotation(group, [-0.02, -0.16, 0.08]);
  return group;
}

function makeAquariumTicket(x: number, y: number, z: number): KeepsakeObject {
  const id: KeepsakeId = "aquarium-ticket";
  const group = makeGroup(id, [x, y, z], 0.005, 0.68);
  addSelectionHalo(group, id);
  const ticket = makeRoundedMesh(id, 1.22, 0.62, 0.08, 0.08, makePhysical(0x8bd4ef, 0.5));
  const stripe = makeRoundedMesh(id, 0.72, 0.08, 0.025, 0.025, makePhysical(0xfff5ca, 0.48), [0.12, 0.05, 0.08]);
  const bubble = makeMesh(id, new THREE.TorusGeometry(0.13, 0.025, 10, 28), makePhysical(0xdff7ff, 0.3), [-0.35, 0.02, 0.1]);
  group.add(ticket, stripe, bubble);
  setRestingRotation(group, [0.04, 0.16, -0.06]);
  return group;
}

function makeCafeCup(x: number, y: number, z: number): KeepsakeObject {
  const id: KeepsakeId = "cafe-cup";
  const group = makeGroup(id, [x, y, z], 0.004, 0.72);
  addSelectionHalo(group, id);
  const cup = makeMesh(id, new THREE.CylinderGeometry(0.34, 0.28, 0.62, 36), makePhysical(0xfff3df, 0.45));
  const coffee = makeMesh(id, new THREE.CylinderGeometry(0.27, 0.27, 0.025, 32), makePhysical(0x8b5d45, 0.6), [0, 0.31, 0]);
  const handle = makeMesh(id, new THREE.TorusGeometry(0.23, 0.055, 10, 28, Math.PI * 1.55), makePhysical(0xfff3df, 0.45), [0.34, 0.03, 0]);
  handle.rotation.z = Math.PI / 2;
  const saucer = makeMesh(id, new THREE.CylinderGeometry(0.5, 0.54, 0.055, 40), makePhysical(0xffd9c8, 0.56), [0, -0.34, 0]);
  group.add(cup, coffee, handle, saucer);
  return group;
}

function makeSunsetPhoto(x: number, y: number, z: number): KeepsakeObject {
  const id: KeepsakeId = "sunset-photo";
  const group = makeGroup(id, [x, y, z], 0.006, 0.68);
  addSelectionHalo(group, id);
  const frame = makeRoundedMesh(id, 0.88, 1.08, 0.055, 0.08, makePhysical(0xfffdf8, 0.5));
  const sky = makeRoundedMesh(id, 0.7, 0.65, 0.035, 0.035, makePhysical(0xf7a889, 0.48), [0, 0.17, 0.08]);
  const sun = makeMesh(id, new THREE.SphereGeometry(0.12, 18, 12), new THREE.MeshStandardMaterial({ color: 0xffe09b, emissive: 0xffbd75, emissiveIntensity: 0.6 }), [0.18, 0.22, 0.14]);
  const horizon = makeRoundedMesh(id, 0.64, 0.1, 0.03, 0.02, makePhysical(0xa978a2, 0.55), [0, -0.02, 0.13]);
  group.add(frame, sky, sun, horizon);
  setRestingRotation(group, [-0.03, -0.2, 0.08]);
  return group;
}

function makeFlower(id: KeepsakeId, petalMaterial: THREE.Material, centerMaterial: THREE.Material, radius: number): THREE.Group {
  const flower = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const petal = makeMesh(id, new THREE.SphereGeometry(radius, 18, 10), petalMaterial, [
      Math.cos(angle) * radius * 0.82,
      Math.sin(angle) * radius * 0.82,
      0,
    ]);
    petal.scale.set(0.68, 0.42, 0.2);
    petal.rotation.z = angle;
    flower.add(petal);
  }
  const center = makeMesh(id, new THREE.SphereGeometry(radius * 0.34, 16, 10), centerMaterial, [0, 0, 0.03]);
  flower.add(center);
  return flower;
}

function makeTriangle(
  id: KeepsakeId,
  width: number,
  height: number,
  material: THREE.Material,
  position: [number, number, number],
): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -height / 2);
  shape.lineTo(width / 2, -height / 2);
  shape.lineTo(0, height / 2);
  shape.closePath();
  const mesh = makeMesh(id, new THREE.ShapeGeometry(shape), material, position);
  mesh.castShadow = false;
  return mesh;
}

function makeCrease(
  id: KeepsakeId,
  length: number,
  material: THREE.Material,
  position: [number, number, number],
  rotationZ: number,
): THREE.Mesh {
  const crease = makeMesh(id, new THREE.CylinderGeometry(0.01, 0.01, length, 8), material, position);
  crease.rotation.z = rotationZ;
  crease.rotation.x = Math.PI / 2;
  crease.castShadow = false;
  return crease;
}

function findKeepsake(object?: THREE.Object3D): KeepsakeObject | null {
  let current: THREE.Object3D | null | undefined = object;
  while (current) {
    if (typeof current.userData.id === "string" && typeof current.userData.baseY === "number") {
      return current as KeepsakeObject;
    }
    current = current.parent;
  }
  return null;
}

function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const material = child.material;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material.dispose();
      }
    }
  });
}
