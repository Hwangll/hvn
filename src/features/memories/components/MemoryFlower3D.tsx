import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface MemoryFlower3DProps {
  reducedMotion: boolean;
}

const flowerColors = {
  petalLight: 0xfff08a,
  petal: 0xffc42e,
  petalDeep: 0xd9870f,
  center: 0x573018,
  seed: 0xd09a43,
  seedDark: 0x2f1d12,
  stem: 0x386a48,
  leaf: 0x5b9d61,
  leafDark: 0x254d35,
  wrap: 0xffead5,
  wrapShadow: 0xd7a97f,
  ribbon: 0xd45a69,
  plinth: 0x121722,
  stone: 0x29303c,
};

export function MemoryFlower3D({ reducedMotion }: MemoryFlower3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [supported, setSupported] = useState(() => typeof WebGLRenderingContext !== "undefined");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supported) {
      return undefined;
    }

    let unsupportedTimer = 0;
    let frameId = 0;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 80);
    camera.position.set(0, 0.32, 5.55);
    camera.lookAt(0, 0.1, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    } catch {
      unsupportedTimer = window.setTimeout(() => setSupported(false), 0);
      return () => window.clearTimeout(unsupportedTimer);
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

    const flower = createMemoryFlower();
    scene.add(flower);

    const ambient = new THREE.HemisphereLight(0xfff5ea, 0x1b1021, 1.45);
    const key = new THREE.DirectionalLight(0xfff2da, 4.2);
    key.position.set(-1.8, 5.4, 4.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 14;
    const rim = new THREE.DirectionalLight(0xffcf6d, 2.1);
    rim.position.set(2.8, 2.4, -2.4);
    const bloom = new THREE.PointLight(0xffd681, 1.7, 7);
    bloom.position.set(0, 1.1, 2.6);
    scene.add(ambient, key, rim, bloom);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const isNarrow = width / height < 0.78;
      camera.position.set(0, isNarrow ? 0.12 : 0.32, isNarrow ? 6.05 : 5.55);
      flower.scale.setScalar(isNarrow ? 0.8 : 0.88);
      camera.lookAt(0, isNarrow ? 0.05 : 0.1, 0);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const render = (time = 0) => {
      const elapsed = time * 0.001;
      if (!reducedMotion) {
        flower.rotation.y = Math.sin(elapsed * 0.42) * 0.09;
        flower.rotation.z = Math.sin(elapsed * 0.34) * 0.012;
        flower.position.y = Math.sin(elapsed * 0.78) * 0.025;
        animatePetals(flower, elapsed);
      }
      renderer.render(scene, camera);
      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(unsupportedTimer);
      resizeObserver.disconnect();
      scene.remove(flower);
      disposeObject(flower);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reducedMotion, supported]);

  return (
    <span className={`memory-flower-3d ${supported ? "" : "is-fallback"}`} ref={containerRef} aria-hidden="true">
      {!supported ? <span className="memory-flower-fallback" /> : null}
    </span>
  );
}

function createMemoryFlower(): THREE.Group {
  const root = new THREE.Group();
  root.rotation.set(-0.02, -0.04, 0);

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(1.38, 1.54, 0.13, 96),
    new THREE.MeshPhysicalMaterial({
      color: flowerColors.plinth,
      clearcoat: 0.26,
      clearcoatRoughness: 0.55,
      roughness: 0.72,
      specularIntensity: 0.28,
    }),
  );
  floor.position.y = -1.28;
  floor.castShadow = true;
  floor.receiveShadow = true;
  root.add(floor);

  const floorEdge = new THREE.Mesh(
    new THREE.CylinderGeometry(1.26, 1.42, 0.045, 96),
    new THREE.MeshPhysicalMaterial({
      color: flowerColors.stone,
      clearcoat: 0.22,
      clearcoatRoughness: 0.62,
      roughness: 0.68,
      specularIntensity: 0.22,
    }),
  );
  floorEdge.position.y = -1.18;
  floorEdge.receiveShadow = true;
  root.add(floorEdge);

  root.add(
    makeStem(
      [
        new THREE.Vector3(-0.04, -1.16, 0.02),
        new THREE.Vector3(-0.02, -0.68, 0.05),
        new THREE.Vector3(0.04, -0.18, 0.02),
        new THREE.Vector3(0.02, 0.34, 0.08),
      ],
      0.036,
    ),
  );
  root.add(
    makeStem(
      [
        new THREE.Vector3(-0.12, -1.12, 0),
        new THREE.Vector3(-0.28, -0.72, -0.02),
        new THREE.Vector3(-0.42, -0.32, -0.06),
        new THREE.Vector3(-0.48, 0.02, -0.08),
      ],
      0.028,
    ),
  );
  root.add(
    makeStem(
      [
        new THREE.Vector3(0.12, -1.12, 0.02),
        new THREE.Vector3(0.28, -0.7, 0.02),
        new THREE.Vector3(0.44, -0.36, -0.04),
        new THREE.Vector3(0.5, -0.02, -0.1),
      ],
      0.028,
    ),
  );

  root.add(makeLeaf([-0.32, -0.53, 0.02], [0.08, 0.15, 0.88], 0.74, 0.22, false));
  root.add(makeLeaf([0.36, -0.42, -0.03], [0.1, -0.24, -0.88], 0.68, 0.2, true));
  root.add(makeLeaf([-0.22, -0.86, 0.04], [0.04, 0.28, 1.08], 0.54, 0.16, false));
  root.add(makeLeaf([0.18, -0.78, 0.03], [0.08, -0.18, -1.02], 0.5, 0.15, true));

  const wrap = makeWrappingPaper();
  root.add(wrap);
  root.add(makeRibbon());

  const mainBloom = makeSunflowerBloom(1);
  mainBloom.position.set(0.02, 0.58, 0.13);
  mainBloom.rotation.set(-0.2, -0.02, 0.02);
  root.add(mainBloom);

  const leftBloom = makeSunflowerBloom(0.66);
  leftBloom.position.set(-0.48, 0.13, -0.05);
  leftBloom.rotation.set(-0.12, 0.18, -0.16);
  root.add(leftBloom);

  const rightBloom = makeSunflowerBloom(0.61);
  rightBloom.position.set(0.5, 0.08, -0.1);
  rightBloom.rotation.set(-0.1, -0.22, 0.13);
  root.add(rightBloom);

  const highlight = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 18, 10),
    new THREE.MeshPhysicalMaterial({
      color: 0xfff8f1,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      transparent: true,
      opacity: 0.72,
    }),
  );
  highlight.position.set(-0.21, 0.75, 0.42);
  highlight.scale.set(1, 0.58, 0.32);
  root.add(highlight);

  return root;
}

function makeStem(points: THREE.Vector3[], radius: number): THREE.Mesh {
  const stem = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, radius, 16),
    makePhysicalMaterial(flowerColors.stem, 0.66, 0.22),
  );
  stem.castShadow = true;
  stem.receiveShadow = true;
  return stem;
}

function makeSunflowerBloom(scale: number): THREE.Group {
  const bloom = new THREE.Group();
  bloom.scale.setScalar(scale);
  bloom.userData = { isBloom: true };
  addPetalLayer(bloom, 24, 0.34, 0.72, 0.16, -0.05, -Math.PI / 22, flowerColors.petalLight, 0.045);
  addPetalLayer(bloom, 22, 0.25, 0.63, 0.145, 0.03, Math.PI / 24, flowerColors.petal, 0.065);
  addPetalLayer(bloom, 18, 0.15, 0.5, 0.12, 0.11, Math.PI / 11, flowerColors.petalDeep, 0.085);
  bloom.add(makeFlowerCenter());
  return bloom;
}

function makeWrappingPaper(): THREE.Group {
  const group = new THREE.Group();
  const paper = new THREE.Mesh(
    new THREE.ConeGeometry(0.58, 0.86, 4, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: flowerColors.wrap,
      roughness: 0.78,
      clearcoat: 0.12,
      clearcoatRoughness: 0.72,
      side: THREE.DoubleSide,
      specularIntensity: 0.16,
    }),
  );
  paper.position.set(0, -0.88, 0.02);
  paper.rotation.set(0.72, 0.12, Math.PI / 4);
  paper.castShadow = true;
  paper.receiveShadow = true;
  group.add(paper);

  const shadowFold = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.78, 4, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: flowerColors.wrapShadow,
      roughness: 0.82,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.42,
    }),
  );
  shadowFold.position.set(0.09, -0.88, 0.06);
  shadowFold.rotation.set(0.74, 0.22, Math.PI / 4 + 0.08);
  group.add(shadowFold);
  return group;
}

function makeRibbon(): THREE.Group {
  const group = new THREE.Group();
  const ribbonMaterial = makePhysicalMaterial(flowerColors.ribbon, 0.5, 0.18);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.58, 14), ribbonMaterial);
  band.position.set(0, -0.76, 0.36);
  band.rotation.set(0, 0, Math.PI / 2);
  band.castShadow = true;
  group.add(band);

  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 18, 10), ribbonMaterial);
  knot.position.set(0, -0.76, 0.39);
  knot.scale.set(1.2, 0.72, 0.45);
  knot.castShadow = true;
  group.add(knot);

  const leftTail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.025), ribbonMaterial);
  leftTail.position.set(-0.13, -0.84, 0.39);
  leftTail.rotation.z = -0.28;
  group.add(leftTail);
  const rightTail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.025), ribbonMaterial);
  rightTail.position.set(0.13, -0.84, 0.39);
  rightTail.rotation.z = 0.28;
  group.add(rightTail);
  return group;
}

function addPetalLayer(
  bloom: THREE.Group,
  count: number,
  radius: number,
  length: number,
  width: number,
  z: number,
  offset: number,
  color: number,
  curl: number,
): void {
  const material = makePhysicalMaterial(color, 0.43, 0.42);
  material.side = THREE.DoubleSide;

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + offset;
    const petal = new THREE.Mesh(makePetalGeometry(length, width, curl), material);
    petal.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
    petal.rotation.set(-0.16 + Math.sin(angle) * 0.16, Math.cos(angle) * 0.18, angle - Math.PI / 2);
    petal.castShadow = true;
    petal.receiveShadow = true;
    petal.userData = {
      baseX: petal.rotation.x,
      baseY: petal.rotation.y,
      phase: i * 0.42 + radius * 3,
      flutter: 0.012 + radius * 0.012,
      isPetal: true,
    };
    bloom.add(petal);
  }
}

function makePetalGeometry(length: number, width: number, curl: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, -length * 0.47);
  shape.bezierCurveTo(width * 0.72, -length * 0.32, width * 0.52, length * 0.28, 0, length * 0.58);
  shape.bezierCurveTo(-width * 0.52, length * 0.28, -width * 0.72, -length * 0.32, 0, -length * 0.47);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.008,
    bevelThickness: 0.006,
    curveSegments: 22,
    depth: 0.022,
  });
  geometry.center();

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const yCurve = Math.max(0, (y + length * 0.45) / length);
    positions.setZ(i, z + Math.pow(yCurve, 1.55) * curl + Math.abs(x) * 0.025);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function makeFlowerCenter(): THREE.Group {
  const group = new THREE.Group();
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 40, 24),
    new THREE.MeshPhysicalMaterial({
      color: flowerColors.center,
      emissive: 0x2c1409,
      emissiveIntensity: 0.04,
      roughness: 0.58,
      clearcoat: 0.2,
      clearcoatRoughness: 0.62,
    }),
  );
  center.scale.set(1, 1, 0.42);
  center.position.z = 0.27;
  center.castShadow = true;
  group.add(center);

  const seedMaterials = [
    makePhysicalMaterial(flowerColors.seed, 0.48, 0.14),
    makePhysicalMaterial(flowerColors.seedDark, 0.6, 0.08),
    makePhysicalMaterial(0x8b5a24, 0.54, 0.1),
  ];
  for (let i = 0; i < 52; i += 1) {
    const radius = Math.sqrt(i / 52) * 0.165;
    const angle = i * 2.399963229728653;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.014 + (i % 4) * 0.0015, 10, 7), seedMaterials[i % seedMaterials.length]);
    bead.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.92, 0.35 + (i % 5) * 0.001);
    bead.castShadow = true;
    group.add(bead);
  }

  return group;
}

function makeLeaf(
  position: [number, number, number],
  rotation: [number, number, number],
  length: number,
  width: number,
  mirrored: boolean,
): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(0, -length * 0.5);
  shape.bezierCurveTo(width * 0.9, -length * 0.16, width * 0.72, length * 0.28, 0, length * 0.52);
  shape.bezierCurveTo(-width * 0.72, length * 0.28, -width * 0.9, -length * 0.16, 0, -length * 0.5);
  const geometry = new THREE.ShapeGeometry(shape, 28);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    positions.setZ(i, Math.abs(x) * 0.05 + (y / length) * 0.02);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhysicalMaterial({
      color: mirrored ? flowerColors.leafDark : flowerColors.leaf,
      roughness: 0.62,
      clearcoat: 0.2,
      clearcoatRoughness: 0.58,
      side: THREE.DoubleSide,
      specularIntensity: 0.22,
    }),
  );
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makePhysicalMaterial(color: number, roughness: number, clearcoat: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    clearcoat,
    clearcoatRoughness: 0.42,
    roughness,
    specularIntensity: 0.36,
  });
}

function animatePetals(root: THREE.Object3D, elapsed: number): void {
  root.traverse((child) => {
    if (!child.userData.isPetal) {
      return;
    }
    const { baseX, baseY, flutter, phase } = child.userData as {
      baseX: number;
      baseY: number;
      flutter: number;
      phase: number;
    };
    child.rotation.x = baseX + Math.sin(elapsed * 1.35 + phase) * flutter;
    child.rotation.y = baseY + Math.cos(elapsed * 1.1 + phase) * flutter * 0.7;
  });
}

function disposeObject(object: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }
    geometries.add(child.geometry);
    const material = child.material;
    if (Array.isArray(material)) {
      material.forEach((item) => materials.add(item));
    } else {
      materials.add(material);
    }
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
