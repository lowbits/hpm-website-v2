import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'js/src/main.js',
    output: {
      file: 'js/dist/main.js',
      format: 'iife',
      name: 'HPM',
      sourcemap: false,
    },
    plugins: [resolve(), terser()],
  },
  {
    input: 'js/src/stage-slider.js',
    output: {
      file: 'js/dist/stage-slider.js',
      format: 'iife',
      name: 'HPMStageSlider',
      sourcemap: false,
      globals: {
        '@splidejs/splide': 'Splide',
        'gsap': 'gsap',
      },
    },
    plugins: [resolve(), terser()],
  },
];
