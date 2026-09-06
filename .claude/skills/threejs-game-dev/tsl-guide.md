# TSL Guide — Three.js Shading Language

TSL (Three.js Shading Language) lets you write shaders as composable JS node functions instead of raw GLSL/WGSL strings. It compiles to either GLSL (WebGL) or WGSL (WebGPU) from the same source, and is required for `NodeMaterial`-based custom materials and compute shaders.

## When to reach for TSL

Use TSL only when a `MeshStandardMaterial`/`MeshBasicMaterial` genuinely can't express what you need:

- Custom vertex displacement (wind, water, procedural deformation)
- Custom fragment coloring driven by runtime data (health bars in-world, dissolve effects, toon shading)
- GPU compute (particle systems with thousands of instances, flocking/boids, cloth)
- Node-based material graphs you want to reuse across meshes

Do **not** use TSL for anything a standard material or a texture can already do — it adds renderer coupling (WebGPU) and complexity for no gameplay benefit. This skill's default performance rule stands: prefer `MeshBasicMaterial`/`MeshStandardMaterial` first.

## Setup

TSL requires the WebGPU renderer (it can also target WebGL2 via `WebGLRenderer` in recent Three.js versions through the node-material backend, but the primary, best-supported path is WebGPU):

```js
import * as THREE from 'three/webgpu';

const renderer = new THREE.WebGPURenderer({ antialias: true });
await renderer.init();
```

## Core imports

```js
import {
  vec3, vec4, float, uniform, texture,
  positionLocal, normalLocal, uv,
  sin, cos, time, mix, smoothstep,
} from 'three/tsl';
import { MeshBasicNodeMaterial, MeshStandardNodeMaterial } from 'three/webgpu';
```

## Example: animated color node material

```js
import { color, uniform, sin, time } from 'three/tsl';
import { MeshBasicNodeMaterial } from 'three/webgpu';

const pulseSpeed = uniform(2.0);

const material = new MeshBasicNodeMaterial();
material.colorNode = color(0x78b14b).mul(
  sin(time.mul(pulseSpeed)).mul(0.5).add(0.5)
);
```

## Example: vertex displacement (wind sway)

```js
import { positionLocal, sin, time, uniform } from 'three/tsl';
import { MeshStandardNodeMaterial } from 'three/webgpu';

const swayAmount = uniform(0.1);
const swaySpeed = uniform(1.5);

const material = new MeshStandardNodeMaterial();
material.positionNode = positionLocal.add(
  sin(time.mul(swaySpeed).add(positionLocal.y)).mul(swayAmount)
);
```

## Uniforms from game state

Bridge `GameState`/`Constants` values into TSL via `uniform()` and update `.value` per frame from `Game.js` — never rebuild the node graph every frame:

```js
const healthUniform = uniform(1.0); // 0..1

// in Game._tick(), after gameState updates:
healthUniform.value = gameState.playerHealth / PLAYER_CONFIG.MAX_HEALTH;
```

## Compute shaders (GPGPU)

For large particle counts or simulation, use `computeNode`/`Fn` compute kernels rather than CPU loops:

```js
import { Fn, instanceIndex, storage } from 'three/tsl';
import { StorageBufferAttribute } from 'three/webgpu';

const positions = new StorageBufferAttribute(particleCount, 3);
const positionStorage = storage(positions, 'vec3', particleCount);

const updateCompute = Fn(() => {
  const pos = positionStorage.element(instanceIndex);
  pos.y.addAssign(float(-0.01)); // gravity
})().compute(particleCount);

// in the render loop:
renderer.computeAsync(updateCompute);
```

## Notes

- TSL node graphs are built once and reused; only their `uniform()` values should change per frame.
- `NodeMaterial` classes are drop-in replacements for their standard counterparts (`MeshBasicNodeMaterial` ~= `MeshBasicMaterial`) but support `.colorNode`, `.positionNode`, `.opacityNode`, etc.
- Keep TSL usage isolated to a clearly named module (e.g. `gameplay/shaders/WindSway.js`) — don't scatter node graph construction across gameplay files.
- If the game ships on WebGL-only targets (older mobile browsers), avoid TSL/WebGPU-only features or provide a WebGLRenderer fallback path.
