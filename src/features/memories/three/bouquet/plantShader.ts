/**
 * GLSL shared by every plant material: a 3D simplex noise, the room breeze that bends a bouquet from its base, and a
 * cheap back-light translucency that stands in for subsurface scattering. Injected with onBeforeCompile, so the parts
 * keep three's physical lighting, shadows and fog.
 */

/** 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT), renamed so it cannot collide with other chunks. */
const simplexNoise = /* glsl */ `
vec4 plantPermute( vec4 x ) { return mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 ); }
vec4 plantTaylorInvSqrt( vec4 r ) { return 1.79284291400159 - 0.85373472095314 * r; }
float plantNoise( vec3 v ) {
	const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );
	const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );
	vec3 i = floor( v + dot( v, C.yyy ) );
	vec3 x0 = v - i + dot( i, C.xxx );
	vec3 g = step( x0.yzx, x0.xyz );
	vec3 l = 1.0 - g;
	vec3 i1 = min( g.xyz, l.zxy );
	vec3 i2 = max( g.xyz, l.zxy );
	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy;
	vec3 x3 = x0 - D.yyy;
	i = mod( i, 289.0 );
	vec4 p = plantPermute( plantPermute( plantPermute( i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) ) + i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) ) + i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );
	vec3 ns = 0.142857142857 * D.wyz - D.xzx;
	vec4 j = p - 49.0 * floor( p * ns.z * ns.z );
	vec4 x_ = floor( j * ns.z );
	vec4 y_ = floor( j - 7.0 * x_ );
	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs( x ) - abs( y );
	vec4 b0 = vec4( x.xy, y.xy );
	vec4 b1 = vec4( x.zw, y.zw );
	vec4 s0 = floor( b0 ) * 2.0 + 1.0;
	vec4 s1 = floor( b1 ) * 2.0 + 1.0;
	vec4 sh = - step( h, vec4( 0.0 ) );
	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
	vec3 p0 = vec3( a0.xy, h.x );
	vec3 p1 = vec3( a0.zw, h.y );
	vec3 p2 = vec3( a1.xy, h.z );
	vec3 p3 = vec3( a1.zw, h.w );
	vec4 norm = plantTaylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;
	vec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );
	m = m * m;
	return 42.0 * dot( m * m, vec4( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 ), dot( p3, x3 ) ) );
}
`;

/**
 * The breeze, in bouquet space. Nothing moves at the wrap; bending grows with the square of the height above it, so
 * stems lean and heads nod while the base stays put. The lean comes from one slow noise field sampled where a part
 * stands (neighbouring parts lean together); thin parts add a quick shiver along their normal, strongest at the tip.
 * A rigid part (a flower head, a leaf) bends by the height of its anchor rather than of each vertex, so it travels
 * as one piece instead of shearing.
 */
const windFunction = /* glsl */ `
uniform float plantTime;
uniform float plantWindStrength;
uniform float plantWindSpeed;
uniform vec2 plantWindDirection;
uniform float plantWindBase;
uniform float plantWindHeight;
uniform float plantSway;
uniform float plantFlutter;

vec3 plantWindOffset( vec3 position, vec3 surfaceNormal, vec2 surfaceUv, vec3 origin, float phaseSeed ) {
	#ifdef PLANT_RIGID
		float height = clamp( ( origin.y - plantWindBase ) / plantWindHeight, 0.0, 1.0 );
	#else
		float height = clamp( ( position.y - plantWindBase ) / plantWindHeight, 0.0, 1.0 );
	#endif
	float bend = height * height;
	float t = plantTime * plantWindSpeed;
	float gust = plantNoise( vec3( origin.xz * 0.45, t * 0.22 ) );
	float lean = plantNoise( vec3( origin.xz * 1.1 + 3.7, t * 0.55 ) ) * 0.65 + gust * 0.35;
	vec3 along = vec3( plantWindDirection.x, 0.0, plantWindDirection.y );
	vec3 across = vec3( - plantWindDirection.y, 0.0, plantWindDirection.x );
	vec3 offset = along * lean + across * sin( t * 1.3 + origin.x * 2.1 + origin.z * 1.7 ) * 0.25;
	offset *= bend * plantSway;
	offset.y -= abs( lean ) * bend * plantSway * 0.12;
	float phase = phaseSeed * 6.2831853;
	float shiver = sin( t * 5.3 + phase ) * 0.6 + sin( t * 8.9 + phase * 1.7 ) * 0.4;
	offset += surfaceNormal * shiver * plantFlutter * surfaceUv.y * surfaceUv.y * ( 0.35 + height );
	return offset * plantWindStrength;
}
`;

/** Merged geometry carries, per vertex, the point its part sways around (xyz) and a seed for its shiver (w). */
const anchorAttribute = /* glsl */ `
#ifdef USE_PLANT_ANCHOR
	attribute vec4 plantAnchor;
#endif
`;

export const plantVertexHeader = anchorAttribute + simplexNoise + windFunction;

/**
 * After begin_vertex: where this vertex sits in bouquet space, and how far the breeze moves it. An instance sways
 * around its own origin; a part of merged geometry around its anchor; anything else around itself.
 */
export const plantBeginVertex = /* glsl */ `
#include <begin_vertex>
vec3 plantPosition = transformed;
vec3 plantSurfaceNormal = normal;
vec3 plantOrigin = transformed;
#ifdef USE_INSTANCING
	plantPosition = ( instanceMatrix * vec4( transformed, 1.0 ) ).xyz;
	plantSurfaceNormal = normalize( mat3( instanceMatrix ) * normal );
	plantOrigin = instanceMatrix[ 3 ].xyz;
#endif
float plantPhaseSeed = fract( sin( dot( plantOrigin, vec3( 12.9898, 78.233, 37.719 ) ) ) * 43758.5453 );
#ifdef USE_PLANT_ANCHOR
	plantOrigin = plantAnchor.xyz;
	plantPhaseSeed = plantAnchor.w;
#endif
vec3 plantWind = plantWindOffset( plantPosition, plantSurfaceNormal, uv, plantOrigin, plantPhaseSeed );
`;

/** project_vertex with the breeze added in bouquet space, after instancing and before the model matrix. */
export const plantProjectVertex = /* glsl */ `
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition.xyz += plantWind;
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;
`;

/** worldpos_vertex likewise, so shadow lookups follow the moved surface. */
export const plantWorldPosVertex = /* glsl */ `
#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition.xyz += plantWind;
	worldPosition = modelMatrix * worldPosition;
#endif
`;

export const plantFragmentHeader = /* glsl */ `
uniform float plantTranslucency;
uniform vec3 plantTranslucencyColor;
#ifdef USE_PLANT_THICKNESSMAP
	uniform sampler2D plantThicknessMap;
#endif
#ifdef PLANT_BACK_TINT
	uniform vec3 plantBackTint;
#endif
`;

/** After color_fragment: the underside of a petal or leaf is paler than its face. */
export const plantColorFragment = /* glsl */ `
#include <color_fragment>
#ifdef PLANT_BACK_TINT
	if ( ! gl_FrontFacing ) diffuseColor.rgb *= plantBackTint;
#endif
`;

/**
 * Light that reaches the eye through a thin part. For each directional light: a view-dependent back-light lobe (bright
 * when the viewer looks toward the light through the petal) plus a wrap term for light arriving on the far face. Thin
 * edges and tips let more through. Added to the direct diffuse, so it is tinted by the petal's own colour.
 */
export const plantTranslucencyFragment = /* glsl */ `
#include <lights_fragment_end>
#if NUM_DIR_LIGHTS > 0
{
	float plantThickness = plantTranslucency;
	#ifdef PLANT_THIN_EDGES
		float plantAcross = abs( vUv.x * 2.0 - 1.0 );
		plantThickness *= mix( 0.7, 1.4, plantAcross * plantAcross ) * mix( 0.8, 1.25, vUv.y );
	#endif
	#ifdef USE_PLANT_THICKNESSMAP
		plantThickness *= texture2D( plantThicknessMap, vUv ).r;
	#endif
	vec3 plantGlow = vec3( 0.0 );
	// A plain loop: three's unroll pragma pastes the body without braces, so it could not declare locals.
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		vec3 plantLight = directionalLights[ i ].direction;
		vec3 plantHalf = normalize( plantLight + geometryNormal * 0.35 );
		float plantBack = pow( saturate( dot( geometryViewDir, - plantHalf ) ), 4.0 );
		float plantWrap = saturate( dot( - geometryNormal, plantLight ) * 0.5 + 0.5 ) * 0.25;
		plantGlow += directionalLights[ i ].color * ( plantBack + plantWrap );
	}
	reflectedLight.directDiffuse += plantGlow * plantThickness * plantTranslucencyColor * diffuseColor.rgb;
}
#endif
`;
