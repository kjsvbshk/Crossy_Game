import * as THREE from "three";

// Sharp-edged box factory for the low-poly geometric look. Drop-in
// replacement for `new THREE.BoxGeometry(w, d, h)`, cached by dimensions so
// the whole game shares one geometry per distinct size.

const geometryCache = new Map();

/**
 * Axis mapping matches BoxGeometry: w→X, d→Y, h→Z.
 */
export function box(width, depth, height) {
  const key = `${width}x${depth}x${height}`;
  let geometry = geometryCache.get(key);
  if (!geometry) {
    geometry = new THREE.BoxGeometry(width, depth, height);
    geometryCache.set(key, geometry);
  }
  return geometry;
}

/** Frees every cached geometry — call only on full teardown. */
export function disposeGeometryCache() {
  for (const geometry of geometryCache.values()) geometry.dispose();
  geometryCache.clear();
}
