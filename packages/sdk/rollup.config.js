import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

function config(args) {
  return [
    {
      input: "src/index.ts",
      output: {
        file: "dist/index.js",
        format: "esm",
        sourcemap: false,
      },
      plugins: [
        nodeResolve(),
        commonjs({
          include: "node_modules/**",
        }),
        typescript({
          tsconfig: "./tsconfig.json",
        }),
        terser(),
      ],
    },
  ];
}

export default config;
