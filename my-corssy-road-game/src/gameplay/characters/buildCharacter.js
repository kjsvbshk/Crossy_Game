import * as THREE from "three";
import { box } from "../../render/geometry";
import { flatMaterial } from "../../render/MaterialLibrary";
import { getCharacter } from "./CharacterDefinitions";

// Assembles the visible character mesh from a CharacterDefinitions entry, as
// separated pieces (body / head / eyes / snout / ears / feet / tail) so the
// silhouette reads clearly and Player.js can animate feet, ears and tail
// independently. Returns the group plus references to the animatable parts.
//
// The collider is NOT set here — Player stamps the one shared CHARACTER.COLLIDER
// so every skin plays identically.

function boxMesh(size, material, castShadow = false) {
  const mesh = new THREE.Mesh(box(size.w, size.d, size.h), material);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = castShadow;
  return mesh;
}

export function buildCharacter(characterId) {
  const def = getCharacter(characterId);
  const p = def.parts;
  const pal = def.palette;

  const group = new THREE.Group();

  const bodyMat = flatMaterial({ color: pal.body });
  const headMat = flatMaterial({ color: pal.head });
  const eyeMat = flatMaterial({ color: pal.eye });
  const footMat = flatMaterial({ color: pal.foot });
  const accentMat = flatMaterial({ color: pal.accent ?? pal.body });

  const fh = p.feet.h;
  const bodyBottomZ = fh * 0.5;
  const bodyCenterZ = bodyBottomZ + p.body.h / 2;
  const bodyTopZ = bodyBottomZ + p.body.h;
  const headCenterZ = bodyTopZ + p.head.h / 2 - (p.head.sinkZ ?? 0);
  const headTopZ = headCenterZ + p.head.h / 2;
  const headFrontY = p.head.d / 2;

  // --- body + belly patch ---
  const body = boxMesh(p.body, bodyMat, true);
  body.position.z = bodyCenterZ;
  group.add(body);

  if (pal.belly) {
    const belly = boxMesh(
      { w: p.body.w * 0.6, d: 1.4, h: p.body.h * 0.62 },
      flatMaterial({ color: pal.belly }),
    );
    belly.position.set(0, p.body.d / 2 + 0.2, bodyCenterZ - p.body.h * 0.08);
    group.add(belly);
  }

  // --- head ---
  const head = boxMesh(p.head, headMat, true);
  head.position.z = headCenterZ;
  group.add(head);

  // --- eyes (protrude past the head's front face; coplanar boxes z-fight) ---
  const eyes = p.eyes;
  const bulgeGeo = eyes.bulge ? new THREE.SphereGeometry(eyes.w / 2, 6, 4) : null;
  const shineGeo = eyes.shine ? new THREE.SphereGeometry(0.9, 6, 4) : null;
  const shineMat = eyes.shine ? flatMaterial({ color: 0xffffff, roughness: 0.3 }) : null;
  [-1, 1].forEach((side) => {
    const eyeY = eyes.bulge ? headFrontY : headFrontY + eyes.d / 2 - 0.5;
    const eyeZ = headCenterZ + eyes.offsetZ;
    const eye = bulgeGeo
      ? new THREE.Mesh(bulgeGeo, eyeMat)
      : boxMesh({ w: eyes.w, d: eyes.d, h: eyes.h }, eyeMat);
    eye.position.set(side * eyes.offsetX, eyeY, eyeZ);
    group.add(eye);
    if (shineGeo) {
      const shine = new THREE.Mesh(shineGeo, shineMat);
      shine.position.set(side * eyes.offsetX + 0.8, eyeY + 1.2, eyeZ + 1);
      group.add(shine);
    }
  });

  // --- snout / beak / nose ---
  if (p.snout && p.snout.kind !== "none") {
    const s = p.snout;
    const snout = boxMesh({ w: s.w, d: s.d, h: s.h }, flatMaterial({ color: pal.snout }));
    snout.position.set(0, headFrontY + s.d / 2 - 1, headCenterZ - (s.dropZ ?? 0));
    group.add(snout);
  }

  // --- ears / antenna ---
  const ears = [];
  const e = p.ears ?? { kind: "none" };
  if (e.kind === "up") {
    [-1, 1].forEach((side) => {
      const ear = boxMesh({ w: e.w, d: e.d, h: e.h }, headMat);
      ear.position.set(side * e.offsetX, 0, headTopZ + e.h / 2 - 1.5);
      ear.rotation.y = side * (e.tilt ?? 0.2);
      group.add(ear);
      ears.push(ear);
    });
  } else if (e.kind === "side") {
    const earMat = flatMaterial({ color: pal.ear ?? pal.head });
    [-1, 1].forEach((side) => {
      const ear = boxMesh({ w: e.w, d: e.d, h: e.h }, earMat);
      ear.position.set(side * (p.head.w / 2 + e.w / 2 - 1), 0, headCenterZ + (e.offsetZ ?? 0));
      ear.rotation.y = side * -0.2;
      group.add(ear);
      ears.push(ear);
    });
  } else if (e.kind === "antenna") {
    const stalk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, e.h, 6),
      footMat,
    );
    stalk.geometry.rotateX(Math.PI / 2);
    stalk.position.set(0, 0, headTopZ + e.h / 2);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(1.6, 6, 4), flatMaterial({ color: pal.eye }));
    tip.position.set(0, 0, headTopZ + e.h);
    group.add(stalk, tip);
    ears.push(stalk, tip);
  }

  // --- hat (optional silhouette topper) ---
  if (p.hat) {
    const hatMat = flatMaterial({ color: pal.hat ?? pal.accent ?? pal.body });
    const crown = boxMesh({ w: p.hat.w, d: p.hat.d, h: p.hat.h }, hatMat, true);
    crown.position.set(0, 0, headTopZ + p.hat.h / 2 - 1);
    group.add(crown);
    if (p.hat.brim) {
      const brim = boxMesh({ w: p.hat.w + 5, d: p.hat.d + 5, h: p.hat.brim }, hatMat);
      brim.position.set(0, 0, headTopZ + p.hat.brim / 2 - 1);
      group.add(brim);
    }
  }

  // --- feet (animatable: bob during the hop) ---
  const feet = [];
  [-1, 1].forEach((side) => {
    const foot = boxMesh(p.feet, footMat);
    foot.position.set(side * p.feet.offsetX, p.body.d * 0.12, fh / 2);
    group.add(foot);
    feet.push(foot);
  });

  // --- tail (animatable: lags behind the hop) ---
  let tail = null;
  if (p.tail) {
    const t = p.tail;
    tail = boxMesh({ w: t.w, d: t.d, h: t.h }, accentMat);
    tail.position.set(0, -(p.body.d / 2 + t.d / 2 - 1), bodyCenterZ - (t.dropZ ?? 0));
    if (t.tiltUp) tail.rotation.x = -0.5;
    if (t.curl) tail.rotation.x = 0.6;
    group.add(tail);
  }

  return { group, feet, ears, tail, juice: def.juice };
}
