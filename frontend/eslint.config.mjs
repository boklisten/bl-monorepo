// @ts-check
import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginCypress from "eslint-plugin-cypress/flat";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import noRelativeImportPathsPlugin from "eslint-plugin-no-relative-import-paths";
import pluginPromise from "eslint-plugin-promise";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";
//import tsParser from "@typescript-eslint/parser";
//import ts from "@typescript-eslint/eslint-plugin";
// import globals from "globals";

// TODO: add eslint-plugin-react-compiler when released
// TODO: enable eslint-plugin-import (absolute imports) when it is properly supported with flat configs

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  pluginCypress.configs.recommended,
  pluginCypress.configs.globals,
  // importPlugin.flatConfigs.recommended,
  // importPlugin.flatConfigs.typescript,
  jsxA11y.flatConfigs.recommended,
  eslintPluginUnicorn.configs["flat/all"],
  pluginPromise.configs["flat/recommended"],
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": hooksPlugin,
      "no-relative-import-paths": noRelativeImportPathsPlugin,
      import: importPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    /*
                languageOptions: {
                  parser: tsParser,
                  globals: {
                    ...globals.browser,
                  },
                  parserOptions: {
                    project: ["tsconfig.json"],
                  },
                },
            */
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...hooksPlugin.configs.recommended.rules,
      //...ts.configs["recommended-requiring-type-checking"].rules,
      //...ts.configs["stylistic-type-checked"].rules,
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        {
          rootDir: "src",
          prefix: "@",
        },
      ],
      "unicorn/consistent-function-scoping": [
        "error",
        {
          checkArrowFunctions: false,
        },
      ],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            pascalCase: true,
            kebabCase: true,
          },
        },
      ],
      "unicorn/no-keyword-prefix": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            prop: false,
            props: false,
            ref: false,
            params: false,
          },
        },
      ],
      "unicorn/no-null": "off",
      // .textContent is very different from .innerText, not interchangeable
      "unicorn/prefer-dom-node-text-content": "off",
      /** @see https://medium.com/weekly-webtips/how-to-sort-imports-like-a-pro-in-typescript-4ee8afd7258a */
      "import/order": [
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
  eslintConfigPrettier,
);
