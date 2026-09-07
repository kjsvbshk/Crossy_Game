import * as THREE from "three";
import { COLORS, RAILWAY_CONFIG } from "../../core/Constants";
import { roundedBox } from "../../render/geometry";
import { clayMaterial } from "../../render/MaterialLibrary";

// Level-crossing signal, placed at the centre of a railway row (Rail.js) so
// it reads from anywhere on the track. A base + mast + white X crossbuck +
// two round red lamps that alternate-flash, plus a striped gate arm that
// TrainController drops across the tracks while a train is warned / passing.
//
// userData.lamps  -> [leftLamp, rightLamp]  (movers.js flashes these)
// userData.gate   -> the arm pivot Group     (movers.js rotates this)

const S = RAILWAY_CONFIG.SIGNAL;

const baseGeometry = roundedBox(S.BASE.w, S.BASE.d, S.BASE.h, 2);
const mastGeometry = new THREE.CylinderGeometry(S.MAST.radius, S.MAST.radius * 1.15, S.MAST.height, 10);
mastGeometry.rotateX(Math.PI / 2);
const plankGeometry = roundedBox(S.CROSSBUCK.plank.w, S.CROSSBUCK.plank.d, S.CROSSBUCK.plank.h, 1.5);
const lampGeometry = new THREE.SphereGeometry(S.LAMP.radius, 14, 10);
const hoodGeometry = new THREE.CylinderGeometry(S.LAMP.radius * 1.25, S.LAMP.radius * 1.25, 3, 12);
hoodGeometry.rotateX(Math.PI / 2);
const armGeometry = roundedBox(S.GATE.arm.w, S.GATE.arm.d, S.GATE.arm.h, 2);
const stripeGeometry = roundedBox(S.GATE.arm.w * 0.16, S.GATE.arm.d + 0.6, S.GATE.arm.h + 0.6, 2);

const metalMaterial = clayMaterial({ color: COLORS.SIGNAL_POLE, roughness: 0.6, flatShading: true });
const crossbuckMaterial = clayMaterial({ color: COLORS.SIGNAL_CROSSBUCK, roughness: 0.7 });
const armMaterial = clayMaterial({ color: COLORS.GATE_ARM, roughness: 0.7 });
const stripeMaterial = clayMaterial({ color: COLORS.GATE_STRIPE, roughness: 0.7 });

function newLamp() {
  const m = new THREE.Mesh(
    lampGeometry,
    new THREE.MeshStandardMaterial({ color: COLORS.SIGNAL_OFF, roughness: 0.45, emissive: 0x000000 }),
  );
  return m;
}

export function SignalLight() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(baseGeometry, metalMaterial);
  base.position.z = S.BASE.h / 2;
  base.castShadow = true;
  group.add(base);

  const mast = new THREE.Mesh(mastGeometry, metalMaterial);
  mast.position.z = S.BASE.h + S.MAST.height / 2;
  mast.castShadow = true;
  group.add(mast);

  // White X crossbuck near the top, facing the approaching player (−Y).
  [-1, 1].forEach((s) => {
    const plank = new THREE.Mesh(plankGeometry, crossbuckMaterial);
    plank.position.set(0, -2.5, S.CROSSBUCK.z);
    plank.rotation.y = (s * Math.PI) / 4;
    group.add(plank);
  });

  // Two lamps on a short cross-bar, each with a little hood.
  const lamps = [];
  [-1, 1].forEach((s) => {
    const hood = new THREE.Mesh(hoodGeometry, metalMaterial);
    hood.position.set(s * S.LAMP.spreadX, -2, S.LAMP.z);
    group.add(hood);

    const lamp = newLamp();
    lamp.position.set(s * S.LAMP.spreadX, -4.5, S.LAMP.z);
    group.add(lamp);
    lamps.push(lamp);
  });
  group.userData.lamps = lamps;

  // Gate arm — pivots at the mast, points up when idle, swings down across
  // the tracks (rotation.y → 0) while a train is coming.
  const gate = new THREE.Group();
  gate.position.set(0, S.GATE.pivotY, S.BASE.h + S.GATE.pivotZ);
  gate.rotation.y = -Math.PI / 2; // raised
  group.add(gate);

  const arm = new THREE.Mesh(armGeometry, armMaterial); // centred on the pivot
  arm.castShadow = true;
  gate.add(arm);
  const half = S.GATE.arm.w / 2;
  [-0.72, -0.26, 0.26, 0.72].forEach((f) => {
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.x = f * half;
    gate.add(stripe);
  });
  group.userData.gate = gate;

  return group;
}
