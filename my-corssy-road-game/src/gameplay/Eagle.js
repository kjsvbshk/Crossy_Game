import * as THREE from "three";
import { EAGLE_CONFIG, COLORS } from "../core/Constants";
import { roundedBox } from "../render/geometry";
import { clayMaterial } from "../render/MaterialLibrary";
import { eventBus, Events } from "../core/EventBus";

// The idle-death eagle. Game.js owns one instance, adds `object3D` to the
// scene, and calls trigger() once gameState.idleTime crosses the grace
// window. update() flies it from high above down onto the target; when it
// lands it emits EAGLE_STRIKE and Game turns that into a game over.

export class Eagle {
  constructor() {
    this.object3D = this._build();
    this.object3D.visible = false;
    this.active = false;
    this._elapsed = 0;
    this._from = new THREE.Vector3();
    this._to = new THREE.Vector3();
  }

  _build() {
    const g = new THREE.Group();
    g.rotation.x = -0.5; // nose-down dive attitude

    const b = EAGLE_CONFIG.BODY;
    const body = new THREE.Mesh(roundedBox(b.width, b.depth, b.height), clayMaterial({ color: COLORS.EAGLE_BODY }));
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(
      roundedBox(b.width * 0.6, b.depth * 0.4, b.height * 0.8),
      clayMaterial({ color: COLORS.EAGLE_HEAD }),
    );
    head.position.set(0, -b.depth * 0.5, b.height * 0.2);
    g.add(head);

    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 7, 6),
      clayMaterial({ color: COLORS.EAGLE_BEAK }),
    );
    beak.rotation.x = -Math.PI / 2;
    beak.position.set(0, -b.depth * 0.72, b.height * 0.1);
    g.add(beak);

    const w = EAGLE_CONFIG.WING;
    this._wings = [-1, 1].map((side) => {
      const wing = new THREE.Mesh(
        roundedBox(w.width, w.depth, w.height),
        clayMaterial({ color: COLORS.EAGLE_WING }),
      );
      // pivot at the wing root: offset the geometry out along Y inside a pivot
      const pivot = new THREE.Group();
      wing.position.y = side * (w.depth / 2);
      pivot.position.x = side * (b.width / 2);
      pivot.add(wing);
      g.add(pivot);
      pivot.userData.side = side;
      return pivot;
    });

    return g;
  }

  /** @param {THREE.Vector3} targetPos world position to dive onto */
  trigger(targetPos) {
    if (this.active) return;
    this.active = true;
    this._elapsed = 0;
    this._to.copy(targetPos);
    this._from.set(
      targetPos.x,
      targetPos.y + EAGLE_CONFIG.START_ABOVE * 0.4,
      targetPos.z + EAGLE_CONFIG.START_ABOVE,
    );
    this.object3D.position.copy(this._from);
    this.object3D.visible = true;
  }

  update(delta) {
    if (!this.active) return;

    this._elapsed += delta;
    const t = Math.min(1, this._elapsed / EAGLE_CONFIG.SWOOP_S);
    const ease = t * t * (3 - 2 * t); // smoothstep
    this.object3D.position.lerpVectors(this._from, this._to, ease);

    const flap = Math.sin(this._elapsed * EAGLE_CONFIG.FLAP_HZ * Math.PI * 2) * 0.7;
    this._wings.forEach((pivot) => (pivot.rotation.x = flap * pivot.userData.side));

    if (t >= 1) {
      this.active = false;
      eventBus.emit(Events.EAGLE_STRIKE);
    }
  }

  reset() {
    this.active = false;
    this._elapsed = 0;
    this.object3D.visible = false;
  }
}
