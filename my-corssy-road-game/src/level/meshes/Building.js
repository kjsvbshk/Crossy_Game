import * as THREE from "three";
import { WORLD, COLORS, BUILDING_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { box } from "../../render/geometry";
import { flatMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";

// A city tower: a slab with recessed dark window bands every floor, a
// parapet, and a rooftop water tank so the skyline isn't flat. Solid — it
// blocks the tile like any non-walkable prop.

const { FOOTPRINT, FLOOR_HEIGHT, WINDOW_BAND } = BUILDING_CONFIG;

const shellGeometryByHeight = new Map();
function getShell(height) {
  let g = shellGeometryByHeight.get(height);
  if (!g) {
    g = box(FOOTPRINT.width, FOOTPRINT.depth, height);
    shellGeometryByHeight.set(height, g);
  }
  return g;
}

// Window band wraps all four sides, sunk just inside the shell face.
const bandGeometry = new THREE.BoxGeometry(FOOTPRINT.width + 1.5, FOOTPRINT.depth + 1.5, WINDOW_BAND);
const parapetGeometry = box(FOOTPRINT.width + 3, FOOTPRINT.depth + 3, 5);
const tankGeometry = new THREE.CylinderGeometry(6, 6, 12, 8);
tankGeometry.rotateX(Math.PI / 2);

const windowMaterial = flatMaterial({ color: COLORS.BUILDING_WINDOW, roughness: 0.5 });
// A few floors glow warm instead of dark glass — reads as lit windows at
// dusk and breaks up an otherwise uniform stack of identical bands.
const windowLitMaterial = flatMaterial({
  color: COLORS.LAMP_HEAD,
  emissive: COLORS.LAMP_HEAD,
  emissiveIntensity: 0.5,
  roughness: 0.5,
});
const LIT_WINDOW_CHANCE = 0.22;
const roofMaterial = flatMaterial({ color: COLORS.BUILDING_ROOF });

function pick(list, seed) {
  return list[Math.floor(seed * list.length) % list.length];
}

function darken(hex, amount) {
  return new THREE.Color(hex).multiplyScalar(1 - amount).getHex();
}

export function Building(tileIndex, height) {
  const building = new THREE.Group();
  building.position.x = tileIndex * WORLD.TILE_SIZE;

  const buildingColor = pick(COLORS.BUILDING, Math.random());
  const shellMaterial = flatMaterial({ color: buildingColor });
  // A darker plinth tone grounds the tower instead of the base reading as
  // the same flat color as the shell above it.
  const baseMaterial = flatMaterial({ color: darken(buildingColor, 0.25) });

  building.add(contactShadow(FOOTPRINT.width / 2 + 2, FOOTPRINT.depth / 2 + 2, { z: CONTACT_SHADOW.Z_ON_GRASS }));

  // A slightly wider ground floor so it plants rather than floats.
  const base = new THREE.Mesh(
    box(FOOTPRINT.width + 4, FOOTPRINT.depth + 4, 10),
    baseMaterial,
  );
  base.position.z = 5;
  base.castShadow = true;
  base.receiveShadow = true;
  building.add(base);

  const shell = new THREE.Mesh(getShell(height), shellMaterial);
  shell.position.z = height / 2 + 6;
  shell.castShadow = true;
  shell.receiveShadow = true;
  building.add(shell);

  for (let z = FLOOR_HEIGHT + 6; z < height; z += FLOOR_HEIGHT) {
    const lit = Math.random() < LIT_WINDOW_CHANCE;
    const band = new THREE.Mesh(bandGeometry, lit ? windowLitMaterial : windowMaterial);
    band.position.z = z;
    building.add(band);
  }

  const roofZ = height + 6;
  const parapet = new THREE.Mesh(parapetGeometry, roofMaterial);
  parapet.position.z = roofZ + 1;
  building.add(parapet);

  const tank = new THREE.Mesh(tankGeometry, roofMaterial);
  tank.position.set(FOOTPRINT.width * 0.18, FOOTPRINT.depth * 0.1, roofZ + 9);
  building.add(tank);

  return building;
}
