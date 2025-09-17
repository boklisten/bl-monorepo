// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";

import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import pluginQuery from "@tanstack/eslint-plugin-query";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import boundaries from "eslint-plugin-boundaries";
import pluginChaiFriendly from "eslint-plugin-chai-friendly";
import { importX } from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import noRelativeImportPathsPlugin from "eslint-plugin-no-relative-import-paths";
import reactPlugin from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
// eslint-disable-next-line import-x/default
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_PATHS = [
  path.join(__dirname, "frontend/tsconfig.json"),
  path.join(__dirname, "backend/tsconfig.json"),
  path.join(__dirname, "tsconfig.eslint.json"),
];

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  reactHooks.configs["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  ...pluginQuery.configs["flat/recommended"],
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: PROJECT_PATHS,
      },
    },
    plugins: {
      boundaries,
      "@next/next": nextPlugin,
      "no-relative-import-paths": noRelativeImportPathsPlugin,
      "react-compiler": reactCompiler,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          project: PROJECT_PATHS,
        }),
      ],
      // Needed for boundaries to import aliases
      "import/resolver": {
        typescript: { project: PROJECT_PATHS, alwaysTryTypes: true },
      },
      "boundaries/elements": [
        { type: "backend-shared", pattern: "backend/shared/**" },
        { type: "backend", pattern: "backend/**" },
        { type: "frontend-shared", pattern: "frontend/src/shared/**" },
        {
          type: "frontend-feature",
          pattern: "frontend/src/features/*/**",
          capture: ["name"],
        },
        {
          type: "frontend-app",
          mode: "file",
          basePattern: "frontend/src/app",
          pattern:
            "{page,layout,error,loading,template,route,robots,ClientPage}.{ts,tsx}",
        },
        {
          type: "frontend-other",
          mode: "file",
          basePattern: "frontend",
          pattern: [
            "global-error.tsx",
            "instrumentation{,-client}.ts",
            "*.config.{ts,mjs}",
          ],
        },
        {
          type: "other",
          mode: "file",
          pattern: "*.config.{ts,mjs}",
        },
      ],
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "boundaries/no-unknown-files": "error",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          message: "${file.type} is not allowed to import ${dependency.type}",
          rules: [
            { from: ["backend"], allow: ["backend-shared"] },
            { from: ["frontend-shared"], allow: ["backend-shared"] },
            {
              from: ["frontend-feature"],
              allow: ["backend-shared", "frontend-shared"],
            },
            {
              from: ["frontend-app"],
              allow: [
                "backend-shared",
                "frontend-shared",
                "frontend-feature",
                "frontend-app",
              ],
            },
            // A feature may import from itself, but not from other features
            {
              from: [["frontend-feature", { name: "*" }]],
              allow: [["frontend-feature", { name: "${from.name}" }]],
            },
          ],
        },
      ],
      "import-x/no-unused-modules": [
        1,
        {
          unusedExports: true,
          missingExports: true,
          ignoreExports: [
            "**/*{page,error,loading,layout,spec,config,next-env.d,instrumentation,instrumentation-client,adonisrc,robots}.{ts,tsx}",
            "backend/{start,config,bin}/*",
            "backend/ace.js",
            "frontend/postcss.config.mjs",
            "eslint.config.mjs",
          ],
        },
      ],
      "import-x/no-named-as-default-member": "off",
      "no-relative-import-paths/no-relative-import-paths": "error",
      "react-compiler/react-compiler": "error",
      /** @see https://medium.com/weekly-webtips/how-to-sort-imports-like-a-pro-in-typescript-4ee8afd7258a */
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["sibling", "parent"],
            "index",
            "unknown",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      /** */
    },
  },
  {
    files: ["backend/tests/*.ts"],
    plugins: { "chai-friendly": pluginChaiFriendly },
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "chai-friendly/no-unused-expressions": "error",
    },
  },
  eslintConfigPrettier,
);
