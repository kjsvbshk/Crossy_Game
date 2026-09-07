import * as THREE from "three";
import { WORLD, COLORS, BUILDING_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { roundedBox } from "../../render/geometry";
import { clayMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";

// A city tower: a bevelled slab with recessed dark window bands every floor,
// a parapet, and a rooftop water tank so the skyline isn't flat. Solid — it
// blocks the tile like any non-walkable prop.

const { FOOTPRINT, FLOOR_HEIGHT, WINDOW_BAND } = BUILDING_CONFIG;

const shellGeometryByHeight = new Map();
function getShell(height) {
  let g = shellGeometryByHeight.get(height);
  if (!g) {
    g = roundedBox(FOOTPRINT.width, FOOTPRINT.depth, height, 3);
    shellGeometryByHeight.set(height, g);
  }
  return g;
}

// Window band wraps all four sides, sunk just inside the shell face.
const bandGeometry = new THREE.BoxGeometry(FOOTPRINT.width + 1.5, FOOTPRINT.depth + 1.5, WINDOW_BAND);
const parapetGeometry = roundedBox(FOOTPRINT.width + 3, FOOTPRINT.depth + 3, 5, 1.5);
const tankGeometry = new THREE.CylinderGeometry(6, 6, 12, 10);
tankGeometry.rotateX(Math.PI / 2);

const windowMaterial = clayMaterial({ color: COLORS.BUILDING_WINDOW, roughness: 0.5 });
const roofMaterial = clayMaterial({ color: COLORS.BUILDING_ROOF });

function pick(list, seed) {
  return list[Math.floor(seed * list.length) % list.length];
}

export function Building(tileIndex, height) {
  const building = new THREE.Group();
  building.position.x = tileIndex * WORLD.TILE_SIZE;

  const shellMaterial = clayMaterial({ color: pick(COLORS.BUILDING, Math.random()) });

  building.add(contactShadow(FOOTPRINT.width / 2 + 2, FOOTPRINT.depth / 2 + 2, { z: CONTACT_SHADOW.Z_ON_GRASS }));

  // A slightly wider ground floor so it plants rather than floats.
  const base = new THREE.Mesh(
    roundedBox(FOOTPRINT.width + 4, FOOTPRINT.depth + 4, 10, 2),
    shellMaterial,
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
    const band = new THREE.Mesh(bandGeometry, windowMaterial);
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
