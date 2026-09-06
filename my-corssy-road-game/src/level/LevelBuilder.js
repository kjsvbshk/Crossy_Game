import * as THREE from "three";
import { generateRows } from "./RowGenerator";
import { Grass } from "./meshes/Grass";
import { Road } from "./meshes/Road";
import { buildProp } from "./meshes/PropFactory";
import { buildVehicle } from "./meshes/VehicleFactory";
import { WORLD, ANIMATION_CONFIG } from "../core/Constants";
import { getBiomeForScore } from "./biomes/BiomeDefinitions";

export class LevelBuilder {
  constructor() {
    this.object3D = new THREE.Group();
    this.metadata = [];
    this._rowGroups = new Map(); // rowIndex -> THREE.Group, so culling doesn't need a scene scan
    this._swayableProps = new Map(); // rowIndex -> swayable meshes, so sway doesn't need a scene scan either
  }

  build() {
    this.reset();
  }

  reset() {
    this.metadata.length = 0;
    this.object3D.remove(...this.object3D.children);
    this._rowGroups.clear();
    this._swayableProps.clear();

    // Grass rows behind the player's starting position always start in the
    // first biome — the player hasn't reached anywhere else yet.
    const startBiomeId = getBiomeForScore(0).id;
    for (let rowIndex = -1; rowIndex >= -WORLD.INITIAL_GRASS_ROWS_BEHIND; rowIndex--) {
      this._addRowGroup(rowIndex, Grass(rowIndex, startBiomeId));
    }
    this._addRowGroup(0, Grass(0, startBiomeId));

    this.addRows();
  }

  addRows() {
    const startRowIndex = this.metadata.length + 1;
    const newMetadata = generateRows(WORLD.ROWS_PER_BATCH, startRowIndex);
    this.metadata.push(...newMetadata);

    newMetadata.forEach((rowData, index) => {
      const rowIndex = startRowIndex + index;
      const row = rowData.type === "scenery"
        ? this._buildSceneryRow(rowIndex, rowData)
        : this._buildVehicleRow(rowIndex, rowData);
      this._addRowGroup(rowIndex, row);
    });
  }

  _addRowGroup(rowIndex, group) {
    this.object3D.add(group);
    this._rowGroups.set(rowIndex, group);
  }

  _buildSceneryRow(rowIndex, rowData) {
    const row = Grass(rowIndex, rowData.biomeId);
    const swayable = [];
    rowData.props.forEach((prop) => {
      const mesh = buildProp(prop);
      row.add(mesh);
      if (mesh.userData.swayPhase !== undefined) swayable.push(mesh);
    });
    if (swayable.length) this._swayableProps.set(rowIndex, swayable);
    return row;
  }

  _buildVehicleRow(rowIndex, rowData) {
    const row = Road(rowIndex, rowData.biomeId);
    rowData.vehicles.forEach((vehicle) => {
      const mesh = buildVehicle(vehicle.kind, vehicle.initialTileIndex, rowData.direction, vehicle.color);
      vehicle.ref = mesh;
      row.add(mesh);
    });
    return row;
  }

  /**
   * Drops rows further behind `highWaterMarkRow` than ROWS_KEPT_BEHIND_PLAYER,
   * both from the scene graph and from `metadata`. Without this, both grow
   * without bound over a long run: the renderer keeps traversing meshes the
   * fixed-frustum camera can never show, and `metadata` keeps every vehicle
   * ref alive. Meshes share geometries/materials (level/meshes/*), so
   * detaching the row Group is enough — there is nothing per-row to dispose.
   *
   * Takes the player's high-water mark (gameState.score), not their live
   * row: a culled row never comes back, so the boundary must be monotonic —
   * it can never retreat just because the player steps backward. Player.js
   * uses this same boundary to block movement back into culled territory.
   */
  cullRowsBehind(highWaterMarkRow) {
    const cullBefore = highWaterMarkRow - WORLD.ROWS_KEPT_BEHIND_PLAYER;

    for (const [rowIndex, group] of this._rowGroups) {
      if (rowIndex < cullBefore) {
        this.object3D.remove(group);
        this._rowGroups.delete(rowIndex);
        this._swayableProps.delete(rowIndex);
      }
    }

    // metadata[i] holds row (i + 1); null out culled entries in place so
    // row-index math elsewhere stays valid without shifting the array.
    const cullBeforeMetadataIndex = cullBefore - 1;
    for (let i = 0; i < cullBeforeMetadataIndex && i < this.metadata.length; i++) {
      this.metadata[i] = null;
    }
  }

  /**
   * Gently rocks vegetal props (trees, bushes, pines — anything tagged with
   * a swayPhase in its mesh factory) back and forth, as if bending at the
   * base in a breeze. Tilts around the horizontal X axis rather than the
   * vertical Z axis — Z would just spin the prop in place like a
   * merry-go-round instead of bending it. Only iterates the currently-visible
   * rows' own tracked list, never the whole scene graph.
   */
  updateSway(elapsed) {
    for (const props of this._swayableProps.values()) {
      for (const mesh of props) {
        mesh.rotation.x = Math.sin(elapsed * ANIMATION_CONFIG.SWAY_SPEED + mesh.userData.swayPhase) * ANIMATION_CONFIG.SWAY_AMPLITUDE;
      }
    }
  }
}
