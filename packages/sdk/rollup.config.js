import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import packageJson from "./package.json" with { type: "json" };

const processArguments = process.argv;
let buildTarget = "cdn" | "nodePackage";

processArguments.forEach((arg) => {
  if (arg.includes("buildType=cdn")) {
    buildTarget = "cdn";
  }
});

const inputFile = buildTarget === "cdn" ? "./src/cdn.ts" : "./src/index.ts";
const outputFile =
  buildTarget === "cdn"
    ? `../../build/sdk/${packageJson.version}/index.js`
    : "dist/index.js";

function config() {
  return [
    {
      input: inputFile,
      output: {
        file: outputFile,
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
          ...(buildTarget === "cdn" && {
            compilerOptions: {
              outDir: "../../build/sdk",
              declaration: false,
            },
          }),
        }),
        terser(),
      ],
    },
  ];
}

export default config;
