import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";
import { applyHandmadeJitter } from "../../render/geometry";

// A tight clump of grass blades — pure decoration on grass rows. Walkable
// (RowGenerator tags it, movementRules ignores it). Blades are thin tapered
// boxes, curved outward, sharing one geometry + material.

const { BLADE, COUNT, FLOWER_CHANCE, FLOWER_COLORS } = PROP_CONFIG.TUFT;
const bladeGeometry = new THREE.BoxGeometry(BLADE.width, BLADE.width, BLADE.height);
bladeGeometry.translate(0, 0, BLADE.height / 2); // pivot at the base
const petalGeometry = new THREE.SphereGeometry(2.4, 7, 5);

export function Tuft(tileIndex, color) {
  const tuft = new THREE.Group();
  tuft.position.x = tileIndex * WORLD.TILE_SIZE;

  const material = clayMaterial({ color, roughness: 0.85 });
  for (let i = 0; i < COUNT; i++) {
    const blade = new THREE.Mesh(bladeGeometry, material);
    const a = (i / COUNT) * Math.PI * 2 + Math.random() * 0.6;
    const r = BLADE.spread * (0.3 + Math.random() * 0.7);
    blade.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    // lean each blade away from centre and give it a random curl
    blade.rotation.x = Math.sin(a) * 0.6 + (Math.random() - 0.5) * 0.3;
    blade.rotation.y = -Math.cos(a) * 0.6 + (Math.random() - 0.5) * 0.3;
    blade.scale.y = 0.5; // flatten into a blade
    blade.castShadow = true;
    tuft.add(blade);

    // Occasionally cap a blade with a bright bloom.
    if (Math.random() < FLOWER_CHANCE) {
      const petal = new THREE.Mesh(
        petalGeometry,
        clayMaterial({ color: FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)], roughness: 0.6 }),
      );
      petal.position.set(blade.position.x, blade.position.y, BLADE.height * 0.55);
      tuft.add(petal);
    }
  }

  applyHandmadeJitter(tuft);
  tuft.userData.swayPhase = Math.random() * Math.PI * 2;
  return tuft;
}
