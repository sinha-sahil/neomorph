import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import serve from "rollup-plugin-serve";
import packageJson from "./package.json" with { type: "json" };

const processArguments = process.argv;
let buildTarget = "cdn" | "nodePackage";
const isDev = process.env.NODE_ENV === "development" || process.env.ROLLUP_WATCH;

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
        ...(isDev && buildTarget === "cdn"
          ? [
              serve({
                contentBase: "../../build/sdk",
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
              }),
            ]
          : []),
      ],
    },
  ];
}

export default config;
