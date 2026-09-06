import * as THREE from "three";
import { PARTICLE_CONFIG } from "../core/Constants";
import { clayMaterial } from "../render/MaterialLibrary";

// Tiny pooled particle bursts for game juice — landing dust, coin sparkle,
// water splash, a crumble on death. One shared geometry, a handful of shared
// materials, a fixed pool that recycles; zero per-frame allocation.

const geometry = new THREE.BoxGeometry(1, 1, 1);

const PRESETS = {
  dust: { color: 0xd9cdb6, count: 7, speed: 42, up: 30, spin: 6, life: 0.45, size: 3.4, gravity: -160 },
  sparkle: { color: 0xf2c43d, count: 12, speed: 70, up: 90, spin: 10, life: 0.6, size: 3.0, gravity: -120, emissive: 0x5a3e00 },
  splash: { color: 0x6fb7c9, count: 14, speed: 60, up: 80, spin: 4, life: 0.55, size: 3.2, gravity: -220 },
  crumble: { color: 0xbfae95, count: 16, speed: 55, up: 70, spin: 8, life: 0.8, size: 4.0, gravity: -180 },
};

export class Particles {
  constructor() {
    this.object3D = new THREE.Group();
    this._pool = [];
    this._active = [];
    for (let i = 0; i < PARTICLE_CONFIG.POOL_SIZE; i++) {
      const mesh = new THREE.Mesh(geometry, clayMaterial({ color: 0xffffff }));
      mesh.visible = false;
      mesh.userData.vel = new THREE.Vector3();
      this.object3D.add(mesh);
      this._pool.push(mesh);
    }
  }

  burst(position, presetName) {
    const preset = PRESETS[presetName];
    if (!preset) return;
    const material = clayMaterial({
      color: preset.color,
      roughness: 0.7,
      emissive: preset.emissive ?? 0x000000,
      emissiveIntensity: preset.emissive ? 0.7 : 1,
    });

    for (let i = 0; i < preset.count && this._pool.length; i++) {
      const p = this._pool.pop();
      p.material = material;
      p.visible = true;
      p.position.copy(position);
      p.position.z += 6;
      p.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      const ang = Math.random() * Math.PI * 2;
      const spd = preset.speed * (0.4 + Math.random() * 0.9);
      const u = p.userData;
      u.vel.set(Math.cos(ang) * spd, Math.sin(ang) * spd, preset.up * (0.5 + Math.random()));
      u.life = preset.life * (0.7 + Math.random() * 0.6);
      u.age = 0;
      u.gravity = preset.gravity;
      u.spin = (Math.random() - 0.5) * preset.spin;
      u.size = preset.size * (0.6 + Math.random() * 0.8);
      p.scale.setScalar(u.size);
      this._active.push(p);
    }
  }

  update(delta) {
    for (let i = this._active.length - 1; i >= 0; i--) {
      const p = this._active[i];
      const u = p.userData;
      u.age += delta;
      if (u.age >= u.life) {
        p.visible = false;
        this._active.splice(i, 1);
        this._pool.push(p);
        continue;
      }
      u.vel.z += u.gravity * delta;
      p.position.addScaledVector(u.vel, delta);
      p.rotation.z += u.spin * delta;
      p.scale.setScalar(u.size * (1 - u.age / u.life)); // linear shrink to nothing
    }
  }

  reset() {
    for (const p of this._active) {
      p.visible = false;
      this._pool.push(p);
    }
    this._active.length = 0;
  }
}
