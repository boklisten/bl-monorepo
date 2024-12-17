// @ts-check
// remember:       "plugin:deprecation/recommended",
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import deprecationPlugin from "eslint-plugin-deprecation";
import importPlugin from "eslint-plugin-import";
import noRelativeImportPathsPlugin from "eslint-plugin-no-relative-import-paths";
import tseslint from "typescript-eslint";
//import tsParser from "@typescript-eslint/parser";
//import ts from "@typescript-eslint/eslint-plugin";

// TODO: enable eslint-plugin-import (absolute imports) when it is properly supported with flat configs

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  // importPlugin.flatConfigs.recommended,
  // importPlugin.flatConfigs.typescript,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: {
      "no-relative-import-paths": noRelativeImportPathsPlugin,
      import: importPlugin,
      deprecation: deprecationPlugin,
    },
    /*
          languageOptions: {
            parser: tsParser,
            parserOptions: {
              project: ["tsconfig.json"],
            },
          },
      */
    rules: {
      //...ts.configs["recommended-requiring-type-checking"].rules,
      //...ts.configs["stylistic-type-checked"].rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        {
          rootDir: "src",
          prefix: "@",
        },
      ],
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
