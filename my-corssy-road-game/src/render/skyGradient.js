import * as THREE from "three";

// A vertical two-stop gradient (deep zenith at the top of the screen, pale
// horizon near the bottom) used as `scene.background`. Cached by color pair
// so re-entering a biome reuses the same texture instead of redrawing.

const cache = new Map();

export function getSkyTexture(zenithHex, horizonHex) {
  const key = `${zenithHex}|${horizonHex}`;
  let texture = cache.get(key);
  if (texture) return texture;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, `#${new THREE.Color(zenithHex).getHexString()}`);
  gradient.addColorStop(1, `#${new THREE.Color(horizonHex).getHexString()}`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, size);

  texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, texture);
  return texture;
}
