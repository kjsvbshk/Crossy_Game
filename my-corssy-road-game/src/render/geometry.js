import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { BEVEL, MATERIAL_CONFIG } from "../core/Constants";

// Beveled-box factory + per-instance "handmade" wobble helpers for the
// claymation redesign. Mesh factories in level/meshes/* and gameplay/* swap
// THREE.BoxGeometry for roundedBox() starting in Phase 1.

const geometryCache = new Map();

/**
 * The corner radius roundedBox() uses when none is passed: a fraction of the
 * smallest side, clamped to BEVEL bounds and to just under half that side
 * (RoundedBoxGeometry degenerates at radius >= min(size) / 2).
 */
export function autoRadius(width, depth, height) {
  const smallest = Math.min(width, depth, height);
  const ceiling = Math.min(BEVEL.MAX_RADIUS, smallest / 2 - 0.01);
  return THREE.MathUtils.clamp(smallest * BEVEL.RADIUS_RATIO, BEVEL.MIN_RADIUS, ceiling);
}

/**
 * Drop-in replacement for `new THREE.BoxGeometry(w, d, h)` with rounded edges.
 * Axis mapping matches BoxGeometry: w→X, d→Y, h→Z. Geometries are cached by
 * their dimensions + radius, mirroring how the box factories already cache.
 *
 * RoundedBoxGeometry needs radius < min(dimension) / 2, so a very thin box
 * (lane lines, eye dots) falls back to a plain BoxGeometry rather than throw.
 */
export function roundedBox(width, depth, height, radius) {
  const maxSafe = Math.min(width, depth, height) / 2 - 1e-3;
  const requested = radius ?? autoRadius(width, depth, height);
  const r = Math.min(requested, maxSafe);

  const key = `${width}x${depth}x${height}x${r <= 0.02 ? "flat" : r}`;
  let geometry = geometryCache.get(key);
  if (!geometry) {
    geometry = r <= 0.02
      ? new THREE.BoxGeometry(width, depth, height)
      : new RoundedBoxGeometry(width, depth, height, BEVEL.SEGMENTS, r);
    geometryCache.set(key, geometry);
  }
  return geometry;
}

/**
 * Rescales a geometry's UVs in place so the shared bump texture (tuned for
 * roughly tile-sized props, see MaterialLibrary) keeps the same texel density
 * on a much bigger flat plane instead of smearing its few noise cycles across
 * the whole surface. `scaleX`/`scaleY` are how many "tile widths" the
 * geometry's U/V span should read as — e.g. a plane WORLD.TILE_SIZE * 10 wide
 * passes scaleX 10 so each tile-width gets one UV unit, same as a normal prop.
 */
export function scaleUV(geometry, scaleX, scaleY = 1) {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * scaleX, uv.getY(i) * scaleY);
  }
  uv.needsUpdate = true;
  return geometry;
}

function signedUnit(rng) {
  return rng() * 2 - 1;
}

/**
 * Nudges an object's scale and Z-rotation by a few percent / a couple of
 * degrees so a row of identical props doesn't read as stamped copies. Additive
 * on rotation.z, so it composes with a factory's own facing rotation. Pass a
 * seeded rng for deterministic layouts.
 */
export function applyHandmadeJitter(object3D, rng = Math.random) {
  const s = MATERIAL_CONFIG.JITTER.SCALE;
  object3D.scale.set(
    object3D.scale.x * (1 + signedUnit(rng) * s),
    object3D.scale.y * (1 + signedUnit(rng) * s),
    object3D.scale.z * (1 + signedUnit(rng) * s),
  );
  object3D.rotation.z += signedUnit(rng) * MATERIAL_CONFIG.JITTER.ROTATION;
}

/** Frees every cached geometry — call only on full teardown. */
export function disposeGeometryCache() {
  for (const geometry of geometryCache.values()) geometry.dispose();
  geometryCache.clear();
}
