import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { plantPartOfMaterial } from "./plantMaterial";
import { plantPartOf, prepareGlbBouquet } from "./plantModel";

/** A modelled bouquet as a glTF loader would hand it over: in metres, off-centre, nested, with its own materials. */
function modelledScene() {
  const scene = new THREE.Group();
  scene.name = "Scene";
  const head = new THREE.Group();
  head.name = "Flower_Head";
  head.position.set(2, 0, 0);
  head.scale.setScalar(0.01);
  const petalMaterial = new THREE.MeshStandardMaterial({ name: "Petal", color: 0x6688cc, roughness: 0.5, metalness: 1, side: THREE.DoubleSide, map: new THREE.Texture() });
  const petals = new THREE.Mesh(new THREE.PlaneGeometry(10, 10).translate(0, 50, 0), petalMaterial);
  petals.name = "petal_main001";
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 40).translate(0, 20, 0), new THREE.MeshStandardMaterial({ name: "Stem" }));
  stem.name = "Stem";
  head.add(petals, stem);
  const leaves = new THREE.Group();
  leaves.name = "leaves";
  const leafGeometry = new THREE.PlaneGeometry(0.1, 0.2);
  const leafMaterial = new THREE.MeshStandardMaterial({ name: "Leaf" });
  const leftLeaf = new THREE.Mesh(leafGeometry, leafMaterial);
  leftLeaf.name = "Cube001";
  leftLeaf.position.set(1.9, 0.2, 0);
  const rightLeaf = new THREE.Mesh(leafGeometry, leafMaterial);
  rightLeaf.name = "Cube002";
  rightLeaf.position.set(2.1, 0.2, 0);
  // Mirrored, as a modeller's negative scale leaves it.
  rightLeaf.scale.set(-1, 1, 1);
  leaves.add(leftLeaf, rightLeaf);
  const plinthProp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshStandardMaterial({ name: "Prop" }));
  // What a bouquet exported from this site carries in its extras: plain data, not a plant material.
  plinthProp.material.userData = { plant: { part: "seed", depth: { type: "MeshDepthMaterial" } } };
  plinthProp.name = "Lamp";
  plinthProp.position.set(2, 0.02, 0.1);
  scene.add(head, leaves, plinthProp);
  return { scene, petalMaterial, leafGeometry };
}

describe("modelled bouquets", () => {
  it("reads what a part is from the first word of its name that names one", () => {
    expect(plantPartOf("petal_main.001")).toBe("petal");
    expect(plantPartOf("Hydrangea_Sepals")).toBe("petal");
    expect(plantPartOf("sunflower-discs")).toBe("seed");
    expect(plantPartOf("Leaf.004")).toBe("leaf");
    expect(plantPartOf("Wrap_Paper_Front")).toBe("wrap");
    expect(plantPartOf("branch2")).toBe("stem");
    expect(plantPartOf("Cube.001")).toBeNull();
  });

  it("stands the model on the plinth at the bouquet's height, centred, with every transform baked in", () => {
    const { scene } = modelledScene();
    const root = prepareGlbBouquet(scene);
    const bouquet = root.getObjectByName("bouquet")!;
    expect(root.children).toEqual([bouquet]);
    const bounds = new THREE.Box3().setFromObject(root);
    expect(bounds.min.y).toBeCloseTo(-1.15, 5);
    expect(bounds.max.y).toBeCloseTo(1.4, 5);
    expect((bounds.min.x + bounds.max.x) / 2).toBeCloseTo(0, 5);
    expect((bounds.min.z + bounds.max.z) / 2).toBeCloseTo(0, 5);
    bouquet.children.forEach((child) => {
      expect(child.parent).toBe(bouquet);
      expect(child.matrix.equals(new THREE.Matrix4())).toBe(true);
    });
  });

  it("gives each named part the plant material its name asks for, keeping the model's look but not its metal", () => {
    const { scene, petalMaterial } = modelledScene();
    const root = prepareGlbBouquet(scene);
    const petals = root.getObjectByName("petal_main001") as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
    const material = petals.material;
    expect(plantPartOfMaterial(material)).toBe("petal");
    expect(material.defines).toMatchObject({ USE_PLANT_ANCHOR: "", PLANT_RIGID: "" });
    expect(material.color.getHex()).toBe(0x6688cc);
    expect(material.map).toBe(petalMaterial.map);
    expect(material.metalness).toBe(0);
    expect(material.side).toBe(THREE.DoubleSide);
    expect(petals.customDepthMaterial).toBeDefined();
    // Unnamed meshes take their part from a named parent, and stems bend along their length rather than as one piece.
    const leaf = root.getObjectByName("Cube001") as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
    expect(plantPartOfMaterial(leaf.material)).toBe("leaf");
    const stem = root.getObjectByName("Stem") as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
    expect(plantPartOfMaterial(stem.material)).toBe("stem");
    expect(stem.material.defines).not.toHaveProperty("PLANT_RIGID");
    // Anything else keeps its own material and stays still, even if the file's extras claim otherwise.
    const lamp = root.getObjectByName("Lamp") as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    expect(lamp.material.name).toBe("Prop");
    expect(plantPartOfMaterial(lamp.material)).toBeNull();
    expect(lamp.customDepthMaterial).toBeUndefined();
  });

  it("sways each mesh around its own centre", () => {
    const { scene } = modelledScene();
    const root = prepareGlbBouquet(scene);
    const leaf = root.getObjectByName("Cube001") as THREE.Mesh;
    const anchor = leaf.geometry.getAttribute("plantAnchor");
    const center = new THREE.Box3().setFromBufferAttribute(leaf.geometry.getAttribute("position") as THREE.BufferAttribute).getCenter(new THREE.Vector3());
    expect(anchor.getX(0)).toBeCloseTo(center.x, 5);
    expect(anchor.getY(anchor.count - 1)).toBeCloseTo(center.y, 5);
  });

  it("copies a geometry shared by two objects and keeps a mirrored copy facing out", () => {
    const { scene, leafGeometry } = modelledScene();
    const root = prepareGlbBouquet(scene);
    const left = root.getObjectByName("Cube001") as THREE.Mesh;
    const right = root.getObjectByName("Cube002") as THREE.Mesh;
    expect(left.geometry).not.toBe(right.geometry);
    expect([left.geometry, right.geometry]).toContain(leafGeometry);
    // Both leaves face +Z: the mirrored one had its triangles turned back the right way round.
    const facing = (mesh: THREE.Mesh) => {
      const position = mesh.geometry.getAttribute("position");
      const index = mesh.geometry.getIndex()!;
      const [a, b, c] = [0, 1, 2].map((corner) => new THREE.Vector3().fromBufferAttribute(position, index.getX(corner)));
      return new THREE.Vector3().crossVectors(b.sub(a), c.sub(a)).z;
    };
    expect(facing(left)).toBeGreaterThan(0);
    expect(facing(right)).toBeGreaterThan(0);
  });

  it("unpacks quantised positions before baking, so nothing is clipped to their range", () => {
    // As gltf-transform's meshopt or quantize leaves a mesh: normalised int16 positions, scaled back up by the node.
    const quantised = new THREE.BufferAttribute(new Int16Array([-32767, 0, 0, 32767, 0, 0, 0, 32767, 0]), 3, true);
    const geometry = new THREE.BufferGeometry().setAttribute("position", quantised);
    const stem = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
    stem.name = "stem";
    stem.scale.setScalar(0.4);
    const scene = new THREE.Group().add(stem);
    const root = prepareGlbBouquet(scene);
    const position = (root.getObjectByName("stem") as THREE.Mesh).geometry.getAttribute("position");
    expect(position.array).toBeInstanceOf(Float32Array);
    expect(position.getY(2)).toBeCloseTo(1.4, 5);
    expect(position.getX(1) - position.getX(0)).toBeCloseTo(2 * 2.55, 4);
  });

  it("lets custom properties name a part or keep it still, and tint its underside", () => {
    const scene = new THREE.Group();
    const material = new THREE.MeshStandardMaterial();
    material.userData = { backTint: [1.2, 1.15, 1.1], translucencyColor: "#c6d2ff" };
    const blossom = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    blossom.name = "Cube";
    blossom.userData = { plantPart: "petal" };
    const vase = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1).translate(0, -1, 0), new THREE.MeshStandardMaterial());
    vase.name = "stem_vase";
    vase.userData = { plantPart: "none" };
    scene.add(blossom, vase);
    const root = prepareGlbBouquet(scene);
    const petal = root.getObjectByName("Cube") as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
    expect(plantPartOfMaterial(petal.material)).toBe("petal");
    expect(petal.material.defines).toHaveProperty("PLANT_BACK_TINT");
    expect(plantPartOfMaterial((root.getObjectByName("stem_vase") as THREE.Mesh).material as THREE.Material)).toBeNull();
  });

  it("moves every copy of an instanced mesh into bouquet space", () => {
    const scene = new THREE.Group();
    const copies = new THREE.InstancedMesh(new THREE.SphereGeometry(0.01), new THREE.MeshStandardMaterial(), 2);
    copies.name = "seeds";
    copies.position.set(5, 0, 0);
    copies.setMatrixAt(0, new THREE.Matrix4().makeTranslation(0, 0, 0));
    copies.setMatrixAt(1, new THREE.Matrix4().makeTranslation(0, 1, 0));
    scene.add(copies);
    const root = prepareGlbBouquet(scene);
    const seeds = root.getObjectByName("seeds") as THREE.InstancedMesh;
    const top = new THREE.Matrix4();
    seeds.getMatrixAt(1, top);
    expect(new THREE.Vector3().setFromMatrixPosition(top).y).toBeGreaterThan(1.3);
    expect(plantPartOfMaterial(seeds.material as THREE.Material)).toBe("seed");
    expect((seeds.material as THREE.MeshPhysicalMaterial).defines).not.toHaveProperty("USE_PLANT_ANCHOR");
  });
});
