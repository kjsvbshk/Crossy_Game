import { RENDERER } from "../../core/Constants";

// One pass, three cheap grades for the low-poly geometric look:
//   - saturation + contrast: pushes flat, untextured color toward a vivid pop.
//   - vignette: pulls the corners down so the eye stays on the lane ahead.
//
// Consumed by core/Game.js as `new ShaderPass(ColorGradeShader)`.

const { GRADE } = RENDERER;

export const ColorGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uVignette: { value: GRADE.VIGNETTE },
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
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uWarmth;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // colour grade: saturation + a gentle S-curve contrast + a touch of
      // warmth — this is what pushes flat, untextured colour toward a
      // deliberate, vivid low-poly look instead of reading as pastel/washed.
      float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(vec3(luma), color.rgb, uSaturation);
      color.rgb = (color.rgb - 0.5) * uContrast + 0.5;
      color.rgb *= vec3(1.0 + uWarmth, 1.0, 1.0 - uWarmth * 0.6);

      // vignette
      float dist = distance(vUv, vec2(0.5));
      color.rgb *= 1.0 - smoothstep(0.4, 0.85, dist) * uVignette;

      gl_FragColor = clamp(color, 0.0, 1.0);
    }
  `,
};
