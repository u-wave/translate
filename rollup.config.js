import resolve from '@rollup/plugin-node-resolve';
import plurals from './scripts/rollup-plugin-plurals';

const pkg = require('./package.json');

export default {
  input: './src/index.mjs',
  output: [
    { format: 'cjs', file: pkg.main, exports: 'named' },
    { format: 'esm', file: pkg.module },
  ],
  plugins: [
    resolve(),
    plurals({
      file: './plurals/[locale].js',
      format: 'cjs',
    }),
    plurals({
      file: './plurals/[locale].mjs',
      format: 'es',
    }),
  ],
};
