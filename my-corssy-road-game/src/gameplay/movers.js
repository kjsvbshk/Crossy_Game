import * as THREE from "three";
import { WORLD, RAILWAY_CONFIG, COLORS } from "../core/Constants";
import { eventBus, Events } from "../core/EventBus";

// Per-frame motion for the non-vehicle movers: river logs (steady drift +
// wrap, exactly like traffic) and railway trains (an idle → warning →
// passing state machine that only spawns the train while it's crossing).
// Vehicles keep their own controller (gameplay/VehicleController.js).

const { MIN_TILE_INDEX, MAX_TILE_INDEX, TILE_SIZE, VEHICLE_ROW_EDGE_BUFFER_TILES } = WORLD;
const beginningOfRow = (MIN_TILE_INDEX - VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;
const endOfRow = (MAX_TILE_INDEX + VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;

export function updateRivers(delta, rows) {
  rows.forEach((rowData) => {
    if (!rowData || rowData.type !== "river") return;
    const distance = rowData.speed * delta;
    rowData.logs.forEach(({ ref }) => {
      if (!ref) return;
      if (rowData.direction) {
        ref.position.x = ref.position.x > endOfRow ? beginningOfRow : ref.position.x + distance;
      } else {
        ref.position.x = ref.position.x < beginningOfRow ? endOfRow : ref.position.x - distance;
      }
    });
  });
}

const _onColor = new THREE.Color(COLORS.SIGNAL_ON);
const _offColor = new THREE.Color(COLORS.SIGNAL_OFF);

export function updateRailways(delta, elapsed, rows) {
  rows.forEach((rowData, i) => {
    if (!rowData || rowData.type !== "railway") return;
    const rowIndex = i + 1;
    const t = rowData.train;
    const lamp = t.signalRef?.userData.lamp;
    t.timer -= delta;

    if (t.state === "idle") {
      if (lamp) lamp.material.color.copy(_offColor);
      if (t.timer <= 0) {
        t.state = "warning";
        t.timer = RAILWAY_CONFIG.WARNING_S;
        eventBus.emit(Events.TRAIN_INCOMING, rowIndex);
      }
      return;
    }

    if (t.state === "warning") {
      // blink the signal until the train arrives
      if (lamp) {
        const on = Math.floor(elapsed * RAILWAY_CONFIG.BLINK_HZ) % 2 === 0;
        lamp.material.color.copy(on ? _onColor : _offColor);
      }
      if (t.timer <= 0) {
        t.state = "passing";
        const len = t.ref.userData.totalLength;
        t.ref.position.x = rowData.direction
          ? beginningOfRow - len / 2
          : endOfRow + len / 2;
        t.ref.visible = true;
      }
      return;
    }

    // passing
    if (lamp) lamp.material.color.copy(_onColor);
    const step = RAILWAY_CONFIG.TRAIN.SPEED * delta;
    const len = t.ref.userData.totalLength;
    t.ref.position.x += rowData.direction ? step : -step;

    const clearedFar = rowData.direction
      ? t.ref.position.x - len / 2 > endOfRow
      : t.ref.position.x + len / 2 < beginningOfRow;
    if (clearedFar) {
      t.state = "idle";
      t.timer = RAILWAY_CONFIG.IDLE_MIN_S + Math.random() * (RAILWAY_CONFIG.IDLE_MAX_S - RAILWAY_CONFIG.IDLE_MIN_S);
      t.ref.visible = false;
    }
  });
}
