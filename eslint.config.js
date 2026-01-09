import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import tailwind from "eslint-plugin-tailwindcss";
import importPlugin from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import promise from "eslint-plugin-promise";
import n from "eslint-plugin-n";
import regexp from "eslint-plugin-regexp";
import eslintComments from "eslint-plugin-eslint-comments";
import eslintConfigPrettier from "eslint-config-prettier";

import astroParser from "astro-eslint-parser";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

// helper: include flat configs only if present
const maybe = (cfg) => (cfg ? [cfg] : []);
const nFlat = n.configs?.["flat/recommended"];
const regexpFlat = regexp.configs?.["flat/recommended"];
const astroFlat = astro.configs?.["flat/recommended"];

export default [
  // Ignores
  {
    ignores: [
      "astro.config.*",
      "dist/**",
      ".astro/**",
      ".vite/**",
      "node_modules/**",
    ],
  },

  // Base JS
  js.configs.recommended,

  // TS (type-aware) — only for JS/TS, not .astro
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      // your TS/JS rules here
    },
  },

  // ✅ Astro support (let this wire the processor)
  ...maybe(astroFlat),

  // If you want extra Astro-specific rules/tweaks, do it here,
  // but do NOT reassign another processor:
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        // Allow frontmatter <script> to be parsed by TS parser
        parser: tsParser,
        extraFileExtensions: [".astro"],
        // IMPORTANT: don't pass TS project here (keeps it fast/stable)
      },
    },
    rules: {
      // examples:
      // "astro/no-unused-css-selector": "warn",
    },
  },

  // Tailwind — include .astro
  {
    files: ["**/*.{astro,html,jsx,tsx}"],
    plugins: { tailwind },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/enforces-shorthand": "warn",
      "tailwindcss/no-custom-classname": "off",
    },
    settings: {
      tailwindcss: {
        astro: true,
        callees: ["classnames", "clsx", "ctl"],
        config: "tailwind.config.js",
      },
    },
  },

  // Import plugin — limit to JS/TS to avoid .astro quirks
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: true,
      },
    },
    rules: {
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          pathGroups: [
            { pattern: "@/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-unresolved": "error",
      "import/no-duplicates": "warn",
      "import/newline-after-import": "warn",
    },
  },

  // Unicorn
  {
    plugins: { unicorn },
    rules: {
      "unicorn/better-regex": "warn",
      "unicorn/filename-case": ["warn", { case: "kebabCase" }],
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/no-array-callback-reference": "warn",
      "unicorn/no-for-loop": "warn",
      "unicorn/prefer-node-protocol": "warn",
      "unicorn/prefer-top-level-await": "warn",
      "unicorn/no-null": "off",
    },
  },

  // SonarJS
  {
    plugins: { sonarjs },
    rules: {
      "sonarjs/no-all-duplicated-branches": "warn",
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-collection-size-mischeck": "error",
      "sonarjs/no-duplicate-string": ["warn", { threshold: 5 }],
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/no-inverted-boolean-check": "warn",
      "sonarjs/no-nested-switch": "warn",
      "sonarjs/no-nested-template-literals": "warn",
      "sonarjs/no-redundant-boolean": "warn",
      "sonarjs/prefer-immediate-return": "warn",
      "sonarjs/prefer-single-boolean-return": "warn",
    },
  },

  // Promises
  {
    plugins: { promise },
    rules: {
      "promise/no-new-statics": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/no-multiple-resolved": "error",
      "promise/no-nesting": "warn",
      "promise/catch-or-return": "warn",
      "promise/always-return": "off",
    },
  },

  // Node
  ...maybe(nFlat),
  {
    plugins: { n },
    rules: {
      "n/no-deprecated-api": "error",
      "n/prefer-global/process": ["warn", "always"],
      "n/no-missing-import": "off", // TS + import plugin handle this
    },
  },

  // RegExp
  ...maybe(regexpFlat),
  {
    plugins: { regexp },
    rules: {
      "regexp/optimal-quantifier-concatenation": "warn",
      "regexp/prefer-character-class": "warn",
    },
  },

  // ESLint-comments
  {
    plugins: { "eslint-comments": eslintComments },
    rules: {
      "eslint-comments/no-aggregating-enable": "error",
      "eslint-comments/no-duplicate-disable": "error",
      "eslint-comments/no-unlimited-disable": "error",
      "eslint-comments/require-description": "warn",
    },
  },

  // App-wide niceties
  {
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
    },
  },

  // Put Prettier last
  eslintConfigPrettier,
];
