import { defineConfig, globalIgnores } from "eslint/config";

import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import js from "@eslint/js";

import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({
  baseDirectory: fileURLToPath(new URL(".", import.meta.url)),
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(["dist", ".turbo", "**/*.cjs"]),
  {
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      ecmaVersion: 2022,
      parserOptions: {},

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier",
    ),

    plugins: {
      "@typescript-eslint": typescriptEslint,
    },

    rules: {
      // typescript-eslint recommends disabling core no-undef on TS projects: the
      // compiler already resolves globals/types, and the rule produces false
      // positives on type-only references. See typescript-eslint FAQ.
      "no-undef": "off",
    },
  },
]);
