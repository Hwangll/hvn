import type * as THREE from "three";
import basisWrapperUrl from "three/examples/jsm/libs/basis/basis_transcoder.js?url";
import basisBinaryUrl from "three/examples/jsm/libs/basis/basis_transcoder.wasm?url";
import dracoWrapperUrl from "three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js?url";
import dracoDecoderUrl from "three/examples/jsm/libs/draco/gltf/draco_decoder.wasm?url";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { prepareGlbBouquet } from "./plantModel";

/**
 * Loads modelled bouquets. Only imported when a bouquet is configured to come from a .glb, so the loaders and their
 * decoders cost nothing otherwise. Handles Draco or Meshopt geometry and KTX2 (Basis Universal) textures. The decoders
 * are three's own copies, served by Vite from node_modules in development and written to dist/decoders/ by a build
 * (see vite.config.ts); the KTX2 loader asks for the Basis transcoder's files by name, from the one folder they share.
 */

const folderOf = (url: string) => url.slice(0, url.lastIndexOf("/") + 1);
const basisFolder = folderOf(basisWrapperUrl);
if (folderOf(basisBinaryUrl) !== basisFolder) throw new Error("The Basis transcoder's two files must be served from one folder.");

interface Loaders {
  gltf: GLTFLoader;
  draco: DRACOLoader;
  ktx2: KTX2Loader;
}

let loaders: Loaders | null = null;

function loadersFor(renderer: THREE.WebGLRenderer): Loaders {
  if (!loaders) {
    const draco = new DRACOLoader().setDecoderPath({ js: dracoWrapperUrl, wasm: dracoDecoderUrl });
    const ktx2 = new KTX2Loader().setTranscoderPath(basisFolder).detectSupport(renderer);
    const gltf = new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx2).setMeshoptDecoder(MeshoptDecoder);
    loaders = { gltf, draco, ktx2 };
  }
  return loaders;
}

/** A modelled bouquet as a cabinet specimen (see prepareGlbBouquet). Rejects if the file cannot be loaded or parsed. */
export async function loadGlbBouquet(url: string, renderer: THREE.WebGLRenderer): Promise<THREE.Group> {
  const gltf = await loadersFor(renderer).gltf.loadAsync(url);
  return prepareGlbBouquet(gltf.scene);
}

/** Stops the decoder workers; the next load starts them again. */
export function releaseGlbLoaders(): void {
  loaders?.draco.dispose();
  loaders?.ktx2.dispose();
  loaders = null;
}
