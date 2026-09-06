import * as THREE from "three";
import { MATERIAL_CONFIG } from "../core/Constants";

// Shared "plastilina" materials for the claymation redesign. Every clay
// material is a rough, non-metallic MeshStandardMaterial carrying the one
// shared bump texture, cached by (color, roughness, flatShading) so the whole
// game shares a couple dozen materials at most. Mesh factories migrate from
// MeshLambertMaterial to clayMaterial() starting in Phase 1.

let _bumpTexture = null;

/**
 * Soft value-noise texture, generated once, reused by every clay material as a
 * bump map. Built lazily so importing this module costs nothing until the
 * first material is actually requested.
 */
function getBumpTexture() {
  if (_bumpTexture) return _bumpTexture;

  const { SIZE, CONTRAST, REPEAT } = MATERIAL_CONFIG.BUMP;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");

  const image = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < image.data.length; i += 4) {
    // Mid-grey ± a little; the sub-pixel redraws below smear this into soft
    // dents instead of leaving it as TV static.
    const n = 128 + (Math.random() * 2 - 1) * 127 * CONTRAST;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = n;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  ctx.globalAlpha = 0.5;
  for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) ctx.drawImage(canvas, dx, dy);
  ctx.globalAlpha = 1;

  _bumpTexture = new THREE.CanvasTexture(canvas);
  _bumpTexture.wrapS = _bumpTexture.wrapT = THREE.RepeatWrapping;
  _bumpTexture.repeat.set(REPEAT, REPEAT);
  return _bumpTexture;
}

const materialCache = new Map();

/**
 * @param {object} opts
 * @param {THREE.ColorRepresentation} opts.color
 * @param {number} [opts.roughness]
 * @param {boolean} [opts.flatShading]  true for hard facets (metal, rock),
 *   false (default) for the smooth rounded look of shaped clay.
 */
export function clayMaterial({
  color,
  roughness = MATERIAL_CONFIG.CLAY_ROUGHNESS,
  flatShading = false,
  emissive = 0x000000,
  emissiveIntensity = 1,
} = {}) {
  const key = `${color}|${roughness}|${flatShading}|${emissive}|${emissiveIntensity}`;
  let material = materialCache.get(key);
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: MATERIAL_CONFIG.CLAY_METALNESS,
      flatShading,
      emissive,
      emissiveIntensity,
      bumpMap: getBumpTexture(),
      bumpScale: MATERIAL_CONFIG.BUMP.SCALE,
    });
    materialCache.set(key, material);
  }
  return material;
}

/** Frees every cached material + the bump texture — call only on full teardown. */
export function disposeMaterialLibrary() {
  for (const material of materialCache.values()) material.dispose();
  materialCache.clear();
  _bumpTexture?.dispose();
  _bumpTexture = null;
}
