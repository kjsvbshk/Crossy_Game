import * as THREE from "three";
import { WORLD, COLORS, PROP_CONFIG } from "../../core/Constants";

const { TRUNK, CROWN_TIERS, CROWN_OVERLAP } = PROP_CONFIG.PINE;

const trunkGeometry = new THREE.CylinderGeometry(TRUNK.radiusTop, TRUNK.radiusBottom, TRUNK.height, 6);
const trunkMaterial = new THREE.MeshLambertMaterial({ color: COLORS.PINE_TRUNK, flatShading: true });

const crownGeometries = CROWN_TIERS.map((tier) => new THREE.ConeGeometry(tier.radius, tier.height, 7));
const crownMaterial = new THREE.MeshLambertMaterial({ color: COLORS.PINE_CROWN, flatShading: true });

export function Pine(tileIndex) {
  const pine = new THREE.Group();
  pine.position.x = tileIndex * WORLD.TILE_SIZE;

  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.z = TRUNK.height / 2;
  pine.add(trunk);

  let z = TRUNK.height;
  crownGeometries.forEach((geometry, i) => {
    const tierHeight = CROWN_TIERS[i].height;
    z += tierHeight / 2 - (i === 0 ? 0 : CROWN_OVERLAP);
    const tier = new THREE.Mesh(geometry, crownMaterial);
    tier.position.z = z;
    tier.castShadow = true;
    tier.receiveShadow = true;
    pine.add(tier);
    z += tierHeight / 2;
  });

  return pine;
}
