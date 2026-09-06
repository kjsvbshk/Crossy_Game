import * as THREE from "three";
import { CONTACT_SHADOW } from "../core/Constants";

// Soft blob dropped under an entity to fake an ambient-occlusion contact
// shadow — cheaper than a real shadow for small props and gives the "sitting
// in a diorama" grounding the claymation style needs. Consumed by mesh
// factories from Phase 1 on; nothing builds one yet.

let _texture = null;
function getShadowTexture() {
  if (_texture) return _texture;

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(0.6, "rgba(0,0,0,0.5)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  _texture = new THREE.CanvasTexture(canvas);
  return _texture;
}

const geometry = new THREE.PlaneGeometry(1, 1);

const materialByOpacity = new Map();
function getMaterial(opacity) {
  const key = opacity.toFixed(2);
  let material = materialByOpacity.get(key);
  if (!material) {
    material = new THREE.MeshBasicMaterial({
      map: getShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity,
    });
    materialByOpacity.set(key, material);
  }
  return material;
}

/**
 * @param {number} radiusX    half-width of the blob (world units)
 * @param {number} [radiusY=radiusX]  half-depth, for a non-round footprint
 * @param {object} [opts]
 * @param {number} [opts.z=CONTACT_SHADOW.Z]  height to sit at — pass
 *   CONTACT_SHADOW.Z_ON_GRASS for something standing on a grass slab
 * @param {number} [opts.opacityScale=1]      multiplies CONTACT_SHADOW.BASE_OPACITY
 * @returns {THREE.Mesh} a flat blob, ready to add as a child of the entity
 *   (or its row) so it tracks the entity's X/Y.
 */
export function contactShadow(radiusX, radiusY = radiusX, { z = CONTACT_SHADOW.Z, opacityScale = 1 } = {}) {
  const mesh = new THREE.Mesh(geometry, getMaterial(CONTACT_SHADOW.BASE_OPACITY * opacityScale));
  mesh.scale.set(radiusX * 2, radiusY * 2, 1);
  mesh.position.z = z;
  mesh.renderOrder = -1; // drawn before the entities it sits under
  return mesh;
}

export function disposeContactShadows() {
  for (const material of materialByOpacity.values()) material.dispose();
  materialByOpacity.clear();
  geometry.dispose();
  _texture?.dispose();
  _texture = null;
}
