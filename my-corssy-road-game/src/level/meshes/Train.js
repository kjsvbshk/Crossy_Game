import * as THREE from "three";
import { WORLD, COLORS, RAILWAY_CONFIG } from "../../core/Constants";
import { roundedBox } from "../../render/geometry";
import { clayMaterial } from "../../render/MaterialLibrary";
import { colliderFromSize } from "../../gameplay/collision";
import { contactShadow } from "../../render/contactShadow";

// A multi-car train. One per railway row, built at level-build time and left
// hidden until TrainController drives it across during a `passing` phase.
// Long and fast — the collider spans the whole consist.

const { TRAIN } = RAILWAY_CONFIG;
const { width: cw, depth: cd, height: ch } = TRAIN.CAR_SIZE;
const carGeometry = roundedBox(cw, cd, ch);
const stripeGeometry = roundedBox(cw * 0.96, cd + 0.6, 5);
const bodyMaterial = clayMaterial({ color: COLORS.TRAIN_BODY });
const stripeMaterial = clayMaterial({ color: COLORS.TRAIN_STRIPE });

export function Train() {
  const train = new THREE.Group();
  train.visible = false;

  const step = cw + TRAIN.CAR_GAP;
  const totalLen = step * TRAIN.CAR_COUNT - TRAIN.CAR_GAP;
  const startX = -totalLen / 2 + cw / 2;

  for (let i = 0; i < TRAIN.CAR_COUNT; i++) {
    const x = startX + i * step;
    const car = new THREE.Mesh(carGeometry, bodyMaterial);
    car.position.set(x, 0, TRAIN.Z);
    car.castShadow = true;
    car.receiveShadow = true;
    train.add(car);

    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.set(x, 0, TRAIN.Z + ch * 0.18);
    train.add(stripe);

    const blob = contactShadow(cw / 2 + 2, cd / 2 + 2);
    blob.position.x = x;
    train.add(blob);
  }

  train.userData.collider = colliderFromSize(
    { width: totalLen, depth: cd, height: ch + 12 },
    { x: 0, y: 0, z: TRAIN.Z },
  );
  train.userData.totalLength = totalLen;
  return train;
}
