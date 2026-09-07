import * as THREE from "three";

// Explicit-collider seam for the claymation redesign.
//
// PhysicsSystem currently derives every hitbox from `Box3.setFromObject(group)`
// — the AABB of the whole mesh group. Once the character and vehicles gain
// detail (mirrors, blades, ears, antennae, an eagle's wings) that AABB would
// inflate and the game would get unfair. A factory can instead stamp
// `object3D.userData.collider`: a THREE.Box3 in the object's own local space
// covering just the solid body. readCollider() prefers it when present.
//
// No factory sets `userData.collider` yet, so this is a no-op today — the seam
// just needs to exist before the redesign phases start using it.

/**
 * Fills `targetBox` (world space) with the collider for `object3D` and returns
 * it. Uses `object3D.userData.collider` (local-space Box3) transformed into
 * world space when present; otherwise falls back to the whole-group AABB,
 * i.e. the exact pre-redesign behaviour.
 */
export function readCollider(object3D, targetBox) {
  const local = object3D.userData.collider;
  if (local) {
    // Match setFromObject: force the world matrix (and ancestors) current,
    // since collisions are checked before the renderer updates them.
    object3D.updateWorldMatrix(true, false);
    return targetBox.copy(local).applyMatrix4(object3D.matrixWorld);
  }
  return targetBox.setFromObject(object3D);
}

/**
 * Builds a local-space Box3 from a centered size, for stamping onto
 * `userData.collider`. `center` is in the object's local frame.
 */
export function colliderFromSize({ width, depth, height }, center = { x: 0, y: 0, z: 0 }) {
  return new THREE.Box3(
    new THREE.Vector3(center.x - width / 2, center.y - depth / 2, center.z - height / 2),
    new THREE.Vector3(center.x + width / 2, center.y + depth / 2, center.z + height / 2),
  );
}
