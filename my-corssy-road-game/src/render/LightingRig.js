import * as THREE from "three";
import { LIGHTING_RIG } from "../core/Constants";

/**
 * Three-point rig for the claymation look: a shadow-casting key, a soft fill
 * that lifts the shadow side, and a warm rim/back light that traces a bright
 * edge so entities separate from the sky — the single biggest readability win
 * for shaped clay. Only the key casts shadows.
 *
 * NOT wired into Game.js yet. Game.js still builds its own AmbientLight +
 * DirectionalLight in _initScene()/_applyBiome(); swapping to this rig happens
 * in the lighting phase, at which point biome definitions gain a `lightingRig`
 * block that apply() consumes.
 */
export class LightingRig {
  constructor() {
    this.group = new THREE.Group();

    // HemisphereLight, not AmbientLight: sky colour from above, warm ground
    // bounce from below — a free vertical gradient across every clay surface.
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
  configureShadow(shadowCamera, mapSize) {
    this.key.shadow.mapSize.set(mapSize, mapSize);
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
