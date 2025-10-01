import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import alias from '@rollup/plugin-alias';
import path from 'path';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: false
    },
    plugins: [
      alias({
        entries: [{ find: '@common', replacement: path.resolve('../common') }]
      }),
      nodeResolve(),
      commonjs({
        include: 'node_modules/**'
      }),
      typescript({
        tsconfig: './tsconfig.json'
      }),
      terser(),
      serve({
        contentBase: 'dist',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      })
    ]
  }
];
