// eslint.config.js
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

// Some plugins publish flat configs; safely include them when available.
const maybe = (cfg) => (cfg ? [cfg] : []);

const nFlat = n.configs?.["flat/recommended"];
const regexpFlat = regexp.configs?.["flat/recommended"];
const astroFlat = astro.configs?.["flat/recommended"];
// Many plugins still ship legacy configs; we’ll enable key rules manually below.

export default [
  // Ignore build & cache folders
  { ignores: ["dist/**", ".astro/**", ".vite/**", "node_modules/**"] },

  // Base JS
  js.configs.recommended,

  // TypeScript (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  // Astro
  ...maybe(astroFlat),

  // Type-aware parser options
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Let ESLint lint <script> inside .astro files
  { files: ["**/*.astro"], processor: astro.processors.astro },

  // Tailwind class checks
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
        callees: ["classnames", "clsx", "ctl"],
        config: "tailwind.config.js",
      },
    },
  },

  // ✅ Import ordering + resolution
  {
    files: ["**/*.{js,jsx,ts,tsx,astro}"],
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

  // ✅ Unicorn (must-have quality rules)
  {
    plugins: { unicorn },
    rules: {
      // A focused subset of high-value rules
      "unicorn/better-regex": "warn",
      "unicorn/filename-case": ["warn", { case: "kebabCase" }],
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/no-array-callback-reference": "warn",
      "unicorn/no-for-loop": "warn",
      "unicorn/no-null": "off", // many TS codebases allow null
      "unicorn/prefer-node-protocol": "warn",
      "unicorn/prefer-top-level-await": "warn",
    },
  },

  // ✅ SonarJS (bug/smell detection)
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

  // ✅ Promises
  {
    plugins: { promise },
    rules: {
      "promise/always-return": "off",
      "promise/no-nesting": "warn",
      "promise/no-new-statics": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/catch-or-return": "warn",
      "promise/no-multiple-resolved": "error",
    },
  },

  // ✅ Node
  ...maybe(nFlat),
  {
    plugins: { n },
    rules: {
      "n/no-deprecated-api": "error",
      "n/prefer-global/process": ["warn", "always"],
      "n/no-missing-import": "off", // handled by import/no-unresolved + TS
    },
  },

  // ✅ RegExp
  ...maybe(regexpFlat),
  {
    plugins: { regexp },
    rules: {
      // a couple of extra safety checks
      "regexp/optimal-quantifier-concatenation": "warn",
      "regexp/prefer-character-class": "warn",
    },
  },

  // ✅ ESLint-comments (keep disables disciplined)
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
  eslintConfigPrettier,
];
