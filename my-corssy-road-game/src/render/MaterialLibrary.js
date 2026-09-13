import * as THREE from "three";
import { MATERIAL_CONFIG } from "../core/Constants";

// Shared flat-shaded materials for the low-poly geometric look. Every
// material is a matte, non-metallic MeshStandardMaterial with no texture —
// color and light alone define the surface — cached by (color, roughness,
// flatShading, emissive, emissiveIntensity) so the whole game shares a
// couple dozen materials at most.

const materialCache = new Map();

/**
 * @param {object} opts
 * @param {THREE.ColorRepresentation} opts.color
 * @param {number} [opts.roughness]
 * @param {boolean} [opts.flatShading]  false only for geometry that must read
 *   as smoothly curved (e.g. a coin's rim); true (default) gives every facet
 *   of a low-segment primitive its own flat, distinct value under the light.
 */
export function flatMaterial({
  color,
  roughness = MATERIAL_CONFIG.ROUGHNESS,
  flatShading = true,
  emissive = 0x000000,
  emissiveIntensity = 1,
} = {}) {
  const key = `${color}|${roughness}|${flatShading}|${emissive}|${emissiveIntensity}`;
  let material = materialCache.get(key);
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: MATERIAL_CONFIG.METALNESS,
      flatShading,
      emissive,
      emissiveIntensity,
    });
    materialCache.set(key, material);
  }
  return material;
}

/** Frees every cached material — call only on full teardown. */
export function disposeMaterialLibrary() {
  for (const material of materialCache.values()) material.dispose();
  materialCache.clear();
}
