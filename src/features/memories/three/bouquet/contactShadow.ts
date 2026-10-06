import * as THREE from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";

/** Meshes on this layer cast contact shadows; the shadow camera draws nothing else (the stage's lights are on it too). */
export const CONTACT_SHADOW_LAYER = 3;

interface ContactShadowOptions {
  /** Footprint on the floor, in scene units. */
  width: number;
  depth: number;
  /** How high above the floor an object still darkens it. */
  reach: number;
  resolution?: number;
  blur?: number;
  opacity?: number;
}

/**
 * The soft darkening where a bouquet meets its plinth: what stands above is rendered from below into a small texture
 * (darker the closer it comes to the floor), blurred twice and laid on the floor as a transparent plane. Cheap enough to
 * refresh every few frames, which keeps it in step with the breeze.
 */
export class ContactShadow {
  readonly group = new THREE.Group();
  private readonly plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly camera: THREE.OrthographicCamera;
  private readonly target: THREE.WebGLRenderTarget;
  private readonly blurTarget: THREE.WebGLRenderTarget;
  private readonly depthMaterial: THREE.MeshDepthMaterial;
  private readonly horizontal: FullScreenQuad;
  private readonly vertical: FullScreenQuad;
  private readonly blur: number;
  private readonly resolution: number;

  constructor({ width, depth, reach, resolution = 512, blur = 2.4, opacity = 0.9 }: ContactShadowOptions) {
    this.resolution = resolution;
    this.blur = blur;
    this.target = new THREE.WebGLRenderTarget(resolution, resolution);
    this.target.texture.generateMipmaps = false;
    this.blurTarget = new THREE.WebGLRenderTarget(resolution, resolution);
    this.blurTarget.texture.generateMipmaps = false;
    // Lying flat and facing down, so its u runs along +x and v along +z, as the upward-looking camera sees them.
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: this.target.texture, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }),
    );
    this.plane.renderOrder = 1;
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, depth / 2, -depth / 2, 0, reach);
    this.camera.rotation.x = Math.PI / 2;
    this.camera.layers.set(CONTACT_SHADOW_LAYER);
    this.group.add(this.plane, this.camera);
    // Black, with alpha falling off with height: whatever touches the floor is darkest.
    this.depthMaterial = new THREE.MeshDepthMaterial({ side: THREE.DoubleSide });
    this.depthMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );",
        "gl_FragColor = vec4( vec3( 0.0 ), pow( 1.0 - fragCoordZ, 2.2 ) );",
      );
    };
    this.depthMaterial.depthTest = false;
    this.depthMaterial.depthWrite = false;
    this.horizontal = new FullScreenQuad(new THREE.ShaderMaterial(HorizontalBlurShader));
    this.vertical = new FullScreenQuad(new THREE.ShaderMaterial(VerticalBlurShader));
  }

  /** Puts every mesh of `subject` on the contact shadow layer. */
  static cast(subject: THREE.Object3D): void {
    subject.traverse((child) => {
      if (child instanceof THREE.Mesh) child.layers.enable(CONTACT_SHADOW_LAYER);
    });
  }

  update(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
    const background = scene.background;
    const override = scene.overrideMaterial;
    const previousTarget = renderer.getRenderTarget();
    const previousAlpha = renderer.getClearAlpha();
    const previousShadows = renderer.shadowMap.autoUpdate;
    // The lights are in this camera's view too; the key light's shadow map is the main pass's to draw.
    const pendingShadows = renderer.shadowMap.needsUpdate;
    scene.background = null;
    scene.overrideMaterial = this.depthMaterial;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = false;
    renderer.setRenderTarget(this.target);
    renderer.setClearAlpha(0);
    renderer.clear();
    renderer.render(scene, this.camera);
    scene.overrideMaterial = override;
    scene.background = background;
    this.blurPass(renderer, this.blur);
    this.blurPass(renderer, this.blur * 0.4);
    renderer.shadowMap.autoUpdate = previousShadows;
    renderer.shadowMap.needsUpdate = pendingShadows;
    renderer.setRenderTarget(previousTarget);
    renderer.setClearAlpha(previousAlpha);
  }

  private blurPass(renderer: THREE.WebGLRenderer, amount: number): void {
    const horizontal = this.horizontal.material as THREE.ShaderMaterial;
    const vertical = this.vertical.material as THREE.ShaderMaterial;
    horizontal.uniforms.tDiffuse.value = this.target.texture;
    horizontal.uniforms.h.value = amount / this.resolution;
    renderer.setRenderTarget(this.blurTarget);
    this.horizontal.render(renderer);
    vertical.uniforms.tDiffuse.value = this.blurTarget.texture;
    vertical.uniforms.v.value = amount / this.resolution;
    renderer.setRenderTarget(this.target);
    this.vertical.render(renderer);
  }

  dispose(): void {
    this.target.dispose();
    this.blurTarget.dispose();
    this.depthMaterial.dispose();
    this.plane.geometry.dispose();
    this.plane.material.dispose();
    (this.horizontal.material as THREE.Material).dispose();
    (this.vertical.material as THREE.Material).dispose();
    this.horizontal.dispose();
    this.vertical.dispose();
  }
}
