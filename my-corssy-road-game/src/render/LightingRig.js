import * as THREE from "three";
import { LIGHTING_RIG } from "../core/Constants";

/**
 * Three-point rig for the low-poly flat-shaded look: a shadow-casting key
 * bright enough that each face's angle to it reads as a distinct flat value,
 * a dim fill that keeps the shadow side off pure black, and a warm rim/back
 * light that traces a bright edge so entities separate from the sky. Only the
 * key casts shadows. Biomes retint it via a `lightingRig` block consumed by
 * apply() (see level/biomes/BiomeDefinitions.js).
 */
export class LightingRig {
  constructor() {
    this.group = new THREE.Group();

    // HemisphereLight, not AmbientLight: sky colour from above, warm ground
    // bounce from below — a free vertical gradient across every surface.
    this.ambient = new THREE.HemisphereLight(
      LIGHTING_RIG.AMBIENT.color,
      LIGHTING_RIG.GROUND_BOUNCE,
      LIGHTING_RIG.AMBIENT.intensity,
    );
    this.key = new THREE.DirectionalLight(LIGHTING_RIG.KEY.color, LIGHTING_RIG.KEY.intensity);
    this.key.castShadow = true;
    this.fill = new THREE.DirectionalLight(LIGHTING_RIG.FILL.color, LIGHTING_RIG.FILL.intensity);
    this.rim = new THREE.DirectionalLight(LIGHTING_RIG.RIM.color, LIGHTING_RIG.RIM.intensity);

    this.ambient.position.set(0, 0, 1); // "sky" is +Z in this scene

    this._place(this.key, LIGHTING_RIG.KEY.position);
    this._place(this.fill, LIGHTING_RIG.FILL.position);
    this._place(this.rim, LIGHTING_RIG.RIM.position);

    this.group.add(this.ambient, this.key, this.fill, this.rim);
  }

  _place(light, p) {
    light.position.set(p.x, p.y, p.z);
    light.up.set(0, 0, 1);
  }

  /**
   * Partial retint/re-intensify, e.g. from a biome's `lightingRig` block.
   * @param {{key?, fill?, rim?, ambient?}} rig  each sub-object may carry
   *   `color` and/or `intensity`; anything omitted is left untouched.
   */
  apply(rig = {}) {
    for (const [name, target] of [
      ["key", this.key],
      ["fill", this.fill],
      ["rim", this.rim],
      ["ambient", this.ambient],
    ]) {
      const override = rig[name];
      if (!override) continue;
      if (override.color !== undefined) target.color.set(override.color);
      if (override.intensity !== undefined) target.intensity = override.intensity;
    }
  }

  /** Copies the shadow-camera frustum + map size onto the key light. */
  configureShadow(shadowCamera, mapSize, normalBias = 0) {
    this.key.shadow.mapSize.set(mapSize, mapSize);
    this.key.shadow.normalBias = normalBias;
    const cam = this.key.shadow.camera;
    const { up, left, right, top, bottom, near, far } = shadowCamera;
    cam.up.set(up.x, up.y, up.z);
    cam.left = left;
    cam.right = right;
    cam.top = top;
    cam.bottom = bottom;
    cam.near = near;
    cam.far = far;
    cam.updateProjectionMatrix();
  }
}
