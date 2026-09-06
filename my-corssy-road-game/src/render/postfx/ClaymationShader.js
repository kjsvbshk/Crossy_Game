import { RENDERER } from "../../core/Constants";

// One pass, three cheap grades that together read as "stop-motion clay diorama":
//   - exposure flicker: a tiny per-frame brightness wobble, the classic
//     shot-on-twos tell. Two stacked sines so it never sounds like a pure tone.
//   - vignette: pulls the corners down so the eye stays on the lane ahead.
//   - film grain: animated per-pixel noise, kept subtle.
//
// Consumed by core/Game.js as `new ShaderPass(ClaymationShader)`; Game.js
// advances `uTime` every frame.

const { GRADE } = RENDERER;

export const ClaymationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignette: { value: GRADE.VIGNETTE },
    uGrain: { value: GRADE.GRAIN },
    uFlicker: { value: GRADE.FLICKER },
    uFlickerSpeed: { value: GRADE.FLICKER_SPEED },
    uSaturation: { value: GRADE.SATURATION },
    uContrast: { value: GRADE.CONTRAST },
    uWarmth: { value: GRADE.WARMTH },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uGrain;
    uniform float uFlicker;
    uniform float uFlickerSpeed;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uWarmth;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // exposure flicker (shot-on-twos tell)
      float f = sin(uTime * uFlickerSpeed) * 0.6 + sin(uTime * uFlickerSpeed * 2.3) * 0.4;
      color.rgb *= 1.0 + f * uFlicker;

      // colour grade: saturation, gentle S-curve contrast, a touch of warmth —
      // this is what pushes flat clay toward vivid plasticine.
      float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(vec3(luma), color.rgb, uSaturation);
      color.rgb = (color.rgb - 0.5) * uContrast + 0.5;
      color.rgb *= vec3(1.0 + uWarmth, 1.0, 1.0 - uWarmth * 0.6);

      // vignette
      float dist = distance(vUv, vec2(0.5));
      color.rgb *= 1.0 - smoothstep(0.4, 0.85, dist) * uVignette;

      // animated film grain
      float g = hash(gl_FragCoord.xy + fract(uTime) * 137.0) - 0.5;
      color.rgb += g * uGrain;

      gl_FragColor = clamp(color, 0.0, 1.0);
    }
  `,
};
