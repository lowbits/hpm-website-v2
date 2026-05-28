import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

/**
 * Rollup plugin that appends raw JS files after the entry module.
 * The appended code becomes part of the bundle and gets minified by terser.
 */
function appendFiles(files) {
  const code = files.map(f => readFileSync(f, 'utf-8')).join('\n');
  return {
    name: 'append-files',
    renderChunk(source) {
      return source + '\n' + code;
    },
  };
}

export default [
  // Main bundle: everything in one minified file
  {
    input: 'js/src/bundle.js',
    output: {
      file: 'js/dist/bundle.js',
      format: 'iife',
      name: 'HPM',
      sourcemap: false,
    },
    plugins: [
      resolve(),
      appendFiles([
        'js/dist/flickity.pkgd.min.js',
        'js/src/main.js',
        'js/src/stage-slider.js',
        'js/dist/accordion.js',
        'js/dist/fade-ins.js',
        'js/dist/teaser-slider.js',
        'js/dist/quotes-slider.js',
        'js/dist/timeline-slider.js',
        'js/dist/benefits-slider.js',
        'js/dist/gallery-slider.js',
      ]),
      terser({ output: { comments: false } }),
    ],
  },
  // Application form – separate (only on job pages)
  {
    input: 'js/src/application-form.js',
    output: {
      file: 'js/dist/application-form.js',
      format: 'iife',
      name: 'HPMApplicationForm',
      sourcemap: false,
    },
    plugins: [terser()],
  },
];
