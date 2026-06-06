import packageJson from './package.json' with { type: 'json' };
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import alias from '@rollup/plugin-alias';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development' || process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/index.ts',
    output: {
      file: `../../build/weaver/${packageJson.version}/index.js`,
      format: 'iife',
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
        tsconfig: './tsconfig.json',
        compilerOptions: {
          outDir: `../../build/weaver/${packageJson.version}`
        }
      }),
      terser({ mangle: false }),
      ...(isDev
        ? [
            serve({
              contentBase: `../../build/weaver/${packageJson.version}`,
              port: 9898,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
              }
            })
          ]
        : [])
    ]
  }
];
