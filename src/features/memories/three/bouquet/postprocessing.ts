import * as THREE from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";

/**
 * A small, restrained finishing chain for a canvas that stays transparent (the museum room behind it is HTML):
 *
 *   scene → [depth of field] → [bloom: bright pass, blur] → finish (bloom, AgX + look, sRGB, vignette, grain) → screen
 *
 * Everything works on premultiplied colour, so blurred edges and glow composite cleanly over the page. Each effect can
 * be switched off for slower machines; the scene pass (multisampled) and the finish always run, so edges stay smooth
 * and the tone mapping never changes.
 */

const vertexShader = /* glsl */ `
precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

/**
 * A gentle lens: a 16-tap golden-angle disc whose radius follows each pixel's distance from the focal plane. A band
 * around the focus stays perfectly sharp, so the flower heads keep every edge and only the plinth's near rim and the
 * dust drifting past the lens soften.
 */
const depthOfFieldShader = /* glsl */ `
precision highp float;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec2 texel;
uniform float cameraNear;
uniform float cameraFar;
uniform float focus;
uniform float focusBand;
uniform float aperture;
uniform float maxBlur;
varying vec2 vUv;

float viewDepth( float depth ) {
	float z = depth * 2.0 - 1.0;
	return ( 2.0 * cameraNear * cameraFar ) / ( cameraFar + cameraNear - z * ( cameraFar - cameraNear ) );
}

/** Blur radius in pixels. Empty pixels (the room shows through) count as far away. */
float circleOfConfusion( vec2 uv ) {
	float depth = texture2D( tDepth, uv ).x;
	float distance = depth >= 1.0 ? cameraFar : viewDepth( depth );
	return clamp( ( abs( distance - focus ) - focusBand ) * aperture, 0.0, maxBlur );
}

void main() {
	float coc = circleOfConfusion( vUv );
	vec4 sum = texture2D( tColor, vUv );
	float weight = 1.0;
	for ( int i = 0; i < 16; i ++ ) {
		float radius = sqrt( ( float( i ) + 0.5 ) / 16.0 ) * coc;
		float angle = float( i ) * 2.39996323;
		vec2 uv = vUv + vec2( cos( angle ), sin( angle ) ) * radius * texel;
		// Gathering as if scattering: a tap counts only if its own blur reaches this pixel, so a sharp edge never
		// smears outward into the blurred (or empty) pixels around it.
		float w = clamp( circleOfConfusion( uv ) - radius + 1.0, 0.0, 1.0 );
		sum += texture2D( tColor, uv ) * w;
		weight += w;
	}
	gl_FragColor = sum / weight;
}
`;

/** Only what is brighter than the threshold carries on into the glow, with a soft knee. */
const brightShader = /* glsl */ `
precision highp float;
uniform sampler2D tColor;
uniform float threshold;
varying vec2 vUv;
void main() {
	vec4 color = texture2D( tColor, vUv );
	float brightness = max( color.r, max( color.g, color.b ) );
	// A stray NaN would spread through every blur pass into a block of garbage; it fails every comparison, so drop it.
	if ( ! ( brightness >= 0.0 && brightness < 65504.0 ) ) {
		gl_FragColor = vec4( 0.0 );
		return;
	}
	float knee = threshold * 0.5;
	float soft = clamp( brightness - threshold + knee, 0.0, 2.0 * knee );
	soft = soft * soft / ( 4.0 * knee + 1e-4 );
	float contribution = max( soft, brightness - threshold ) / max( brightness, 1e-4 );
	gl_FragColor = vec4( color.rgb * contribution, 0.0 );
}
`;

const blurShader = /* glsl */ `
precision highp float;
uniform sampler2D tColor;
uniform vec2 direction;
varying vec2 vUv;
void main() {
	vec3 sum = texture2D( tColor, vUv ).rgb * 0.227027;
	sum += texture2D( tColor, vUv + direction * 1.3846153 ).rgb * 0.3162162;
	sum += texture2D( tColor, vUv - direction * 1.3846153 ).rgb * 0.3162162;
	sum += texture2D( tColor, vUv + direction * 3.2307692 ).rgb * 0.0702702;
	sum += texture2D( tColor, vUv - direction * 3.2307692 ).rgb * 0.0702702;
	gl_FragColor = vec4( sum, 0.0 );
}
`;

/** Glow, then tone mapping and the sRGB transfer, then a faint vignette and moving grain over what is drawn. */
const finishShader = /* glsl */ `
precision highp float;
uniform sampler2D tColor;
uniform sampler2D tBloom;
uniform float bloomStrength;
uniform float vignette;
uniform float grain;
uniform float time;
uniform vec2 aspect;
uniform float lookPower;
uniform float lookSaturation;
#include <tonemapping_pars_fragment>
#include <colorspace_pars_fragment>
varying vec2 vUv;

/**
 * three's AgX with a look graded in its log domain, close to Blender's "Punchy" (an ASC CDL: power, then saturation
 * around the result's luma). Base AgX turns a sunflower's yellow to apricot; the golden look keeps the petals golden
 * while bright highlights still roll off toward white the way film does. Each light preset brings its own look.
 */
vec3 agxLookToneMapping( vec3 color ) {
	const mat3 inset = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 outset = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float minEv = - 12.47393;
	const float maxEv = 4.026069;
	color = inset * ( LINEAR_SRGB_TO_LINEAR_REC2020 * ( color * toneMappingExposure ) );
	color = clamp( ( log2( max( color, 1e-10 ) ) - minEv ) / ( maxEv - minEv ), 0.0, 1.0 );
	color = pow( max( agxDefaultContrastApprox( color ), 0.0 ), vec3( lookPower ) );
	float luma = dot( color, vec3( 0.2126, 0.7152, 0.0722 ) );
	color = luma + lookSaturation * ( color - luma );
	color = pow( max( outset * color, 0.0 ), vec3( 2.2 ) );
	return clamp( LINEAR_REC2020_TO_LINEAR_SRGB * color, 0.0, 1.0 );
}

float hash( vec2 p ) {
	vec3 p3 = fract( vec3( p.xyx ) * 0.1031 );
	p3 += dot( p3, p3.yzx + 33.33 );
	return fract( ( p3.x + p3.y ) * p3.z );
}

vec3 displayColor( vec3 light ) {
	return sRGBTransferOETF( vec4( agxLookToneMapping( light ), 1.0 ) ).rgb;
}

void main() {
	vec4 scene = texture2D( tColor, vUv );
	float alpha = scene.a;
	vec3 glow = vec3( 0.0 );
	#ifdef USE_BLOOM
		glow = texture2D( tBloom, vUv ).rgb * bloomStrength;
	#endif
	// Tone map and encode the straight colour, then premultiply. Neither curve is linear: run on a half-covered edge pixel
	// as stored, they would shade it darker and more saturated than its own surface and outline the bouquet.
	vec3 surface = displayColor( scene.rgb / max( alpha, 1e-4 ) + glow );
	vec2 centred = ( vUv - 0.5 ) * aspect;
	surface *= 1.0 - vignette * smoothstep( 0.25, 0.85, length( centred ) );
	float noise = hash( floor( gl_FragCoord.xy ) + fract( time * 7.3 ) * 517.0 ) - 0.5;
	float luma = dot( surface, vec3( 0.299, 0.587, 0.114 ) );
	surface += noise * grain * ( 1.0 - abs( luma * 2.0 - 1.0 ) * 0.6 );
	// Past the edge, glow only adds light over the room, with barely any coverage of its own.
	vec3 spill = displayColor( glow ) * ( 1.0 - alpha );
	float spillCover = clamp( max( spill.r, max( spill.g, spill.b ) ) * 0.35, 0.0, 1.0 );
	gl_FragColor = vec4( surface * alpha + spill, alpha + ( 1.0 - alpha ) * spillCover );
}
`;

function quad(fragmentShader: string, uniforms: Record<string, THREE.IUniform>): FullScreenQuad {
  return new FullScreenQuad(new THREE.RawShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false }));
}

export interface PostEffects {
  depthOfField: boolean;
  bloom: boolean;
  /** Vignette and grain; nearly free. */
  finish: boolean;
}

export class BouquetPost {
  effects: PostEffects = { depthOfField: true, bloom: true, finish: true };
  /** Distance from the camera to the plane in focus. */
  focus = 5.3;
  bloomStrength = 0.2;
  exposure = 1;
  /** The grade after tone mapping: contrast as a power, and saturation (see lighting presets). */
  look = { power: 1.25, saturation: 1.4 };
  private width = 1;
  private height = 1;
  private readonly sceneTarget: THREE.WebGLRenderTarget;
  private readonly dofTarget: THREE.WebGLRenderTarget;
  private readonly brightTarget: THREE.WebGLRenderTarget;
  private readonly blurA: THREE.WebGLRenderTarget;
  private readonly blurB: THREE.WebGLRenderTarget;
  private readonly dof: FullScreenQuad;
  private readonly bright: FullScreenQuad;
  private readonly blur: FullScreenQuad;
  private readonly finish: FullScreenQuad;
  private readonly finishMaterial: THREE.RawShaderMaterial;
  private finishKey = "";

  constructor(private readonly renderer: THREE.WebGLRenderer) {
    const options = { type: THREE.HalfFloatType, depthBuffer: false };
    this.sceneTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4, depthTexture: new THREE.DepthTexture(1, 1) });
    this.dofTarget = new THREE.WebGLRenderTarget(1, 1, options);
    this.brightTarget = new THREE.WebGLRenderTarget(1, 1, options);
    this.blurA = new THREE.WebGLRenderTarget(1, 1, options);
    this.blurB = new THREE.WebGLRenderTarget(1, 1, options);
    this.dof = quad(depthOfFieldShader, {
      tColor: { value: null }, tDepth: { value: null }, texel: { value: new THREE.Vector2() },
      cameraNear: { value: 0.1 }, cameraFar: { value: 30 }, focus: { value: 5.3 }, focusBand: { value: 0.45 }, aperture: { value: 2.2 }, maxBlur: { value: 7 },
    });
    // Only true highlights (a glint, a rim-lit edge) are bright enough to glow.
    this.bright = quad(brightShader, { tColor: { value: null }, threshold: { value: 3 } });
    this.blur = quad(blurShader, { tColor: { value: null }, direction: { value: new THREE.Vector2() } });
    this.finish = quad(finishShader, {
      tColor: { value: null }, tBloom: { value: null }, bloomStrength: { value: 0.2 }, vignette: { value: 0.22 }, grain: { value: 0.028 },
      time: { value: 0 }, aspect: { value: new THREE.Vector2(1, 1) }, toneMappingExposure: { value: 1 },
      lookPower: { value: 1.25 }, lookSaturation: { value: 1.4 },
    });
    this.finishMaterial = this.finish.material as THREE.RawShaderMaterial;
  }

  setSize(width: number, height: number): void {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.sceneTarget.setSize(this.width, this.height);
    this.dofTarget.setSize(this.width, this.height);
    const half = [Math.max(1, Math.round(this.width / 2)), Math.max(1, Math.round(this.height / 2))] as const;
    const quarter = [Math.max(1, Math.round(this.width / 4)), Math.max(1, Math.round(this.height / 4))] as const;
    this.brightTarget.setSize(...half);
    this.blurA.setSize(...quarter);
    this.blurB.setSize(...quarter);
    const uniforms = this.finishMaterial.uniforms;
    const longest = Math.max(this.width, this.height);
    uniforms.aspect.value.set(this.width / longest, this.height / longest);
  }

  /**
   * Runs `work` with the scene pass's target bound, so the programs compiled in it are the ones the scene pass draws
   * with: three compiles a material differently for this linear target than for the canvas.
   */
  inScenePass<T>(work: () => T): T {
    const renderer = this.renderer;
    const previous = renderer.getRenderTarget();
    renderer.setRenderTarget(this.sceneTarget);
    try {
      return work();
    } finally {
      renderer.setRenderTarget(previous);
    }
  }

  render(scene: THREE.Scene, camera: THREE.PerspectiveCamera, time: number): void {
    const renderer = this.renderer;
    renderer.setRenderTarget(this.sceneTarget);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);
    let color = this.sceneTarget.texture;

    if (this.effects.depthOfField) {
      const uniforms = (this.dof.material as THREE.RawShaderMaterial).uniforms;
      uniforms.tColor.value = color;
      uniforms.tDepth.value = this.sceneTarget.depthTexture;
      uniforms.texel.value.set(1 / this.width, 1 / this.height);
      uniforms.cameraNear.value = camera.near;
      uniforms.cameraFar.value = camera.far;
      uniforms.focus.value = this.focus;
      // Blur is in pixels per unit of distance, so it reads the same at any canvas size.
      uniforms.maxBlur.value = Math.max(2, this.height / 140);
      uniforms.aperture.value = this.height / 360;
      renderer.setRenderTarget(this.dofTarget);
      this.dof.render(renderer);
      color = this.dofTarget.texture;
    }

    const bloom = this.effects.bloom && this.bloomStrength > 0.001;
    if (bloom) {
      (this.bright.material as THREE.RawShaderMaterial).uniforms.tColor.value = color;
      renderer.setRenderTarget(this.brightTarget);
      this.bright.render(renderer);
      const blur = (this.blur.material as THREE.RawShaderMaterial).uniforms;
      const passes: Array<[THREE.Texture, THREE.WebGLRenderTarget, number, number]> = [
        [this.brightTarget.texture, this.blurA, 1, 0],
        [this.blurA.texture, this.blurB, 0, 1],
        [this.blurB.texture, this.blurA, 2, 0],
        [this.blurA.texture, this.blurB, 0, 2],
      ];
      for (const [input, output, x, y] of passes) {
        blur.tColor.value = input;
        blur.direction.value.set(x / output.width, y / output.height);
        renderer.setRenderTarget(output);
        this.blur.render(renderer);
      }
    }

    const key = `${bloom}`;
    if (key !== this.finishKey) {
      this.finishKey = key;
      this.finishMaterial.defines = bloom ? { USE_BLOOM: "" } : {};
      this.finishMaterial.needsUpdate = true;
    }
    const uniforms = this.finishMaterial.uniforms;
    uniforms.tColor.value = color;
    uniforms.tBloom.value = this.blurB.texture;
    uniforms.bloomStrength.value = this.bloomStrength;
    uniforms.vignette.value = this.effects.finish ? 0.22 : 0;
    uniforms.grain.value = this.effects.finish ? 0.028 : 0;
    uniforms.time.value = time;
    uniforms.toneMappingExposure.value = this.exposure;
    uniforms.lookPower.value = this.look.power;
    uniforms.lookSaturation.value = this.look.saturation;
    renderer.setRenderTarget(null);
    this.finish.render(renderer);
  }

  dispose(): void {
    for (const target of [this.sceneTarget, this.dofTarget, this.brightTarget, this.blurA, this.blurB]) {
      target.depthTexture?.dispose();
      target.dispose();
    }
    for (const pass of [this.dof, this.bright, this.blur, this.finish]) {
      (pass.material as THREE.Material).dispose();
      pass.dispose();
    }
  }
}
