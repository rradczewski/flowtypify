import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    external: ['fs', 'uppercamelcase', 'babel-polyfill', 'ramda', 'yargs', 'prettier'],
    plugins: [
      babel({
        exclude: ['node_modules/**']
      })
    ]
  },
  {
    input: 'src/cli.js',
    output: [{ file: pkg.bin, format: 'cjs', banner: '#!/usr/bin/env node' }],
    external: ['fs', 'uppercamelcase', 'babel-polyfill', 'ramda', 'yargs', 'prettier'],
    plugins: [
      babel({
        exclude: ['node_modules/**']
      })
    ]
  }
];
