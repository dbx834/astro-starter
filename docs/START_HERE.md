# README

## Quick start

### Prerequisites

* **Node.js:** use **Node 20.3+** (Astro 5.x has moved its minimum Node requirement up to 20.3+). ([Astro][astro-1])
* **Package manager:** `pnpm` (scripts below assume pnpm).

### Install

```bash
# install dependencies
pnpm install
````

### Run locally

```bash
# start dev server
pnpm run dev

# dev server (force rebuild) — handy if something gets “stuck”
pnpm run devc
```

### Build & preview

```bash
# production build (note: uses a large memory limit via NODE_OPTIONS)
pnpm run build

# build (force)
pnpm run buildf

# preview the production build locally
pnpm run preview
```

### Code quality

```bash
# lint JS/TS/Astro
pnpm run lint
pnpm run lint:fix

# format
pnpm run format
pnpm run format:check

# lint CSS/SCSS/Astro/HTML styles
pnpm run stylelint
pnpm run stylelint:fix

# spellcheck
pnpm run spell
pnpm run spell:changed
pnpm run spell:md

# check commit messages (vs origin/main)
pnpm run commitlint
```

### Deploy (Netlify)

```bash
# creates a draft deploy (deploy preview)
pnpm run deploy-preview

# deploy to production
pnpm run deploy
```

Netlify CLI’s `deploy` command creates a draft deploy by default; `--prod` deploys to your live site. ([Netlify CLI command reference][netlify-1])

> **Note (Windows):** scripts that set `NODE_OPTIONS='...'` may not work in `cmd.exe`. Use PowerShell, or adapt the scripts (or add `cross-env`) if needed.

---

## Libraries

### Runtime dependencies

* [@astrojs/partytown](https://www.npmjs.com/package/@astrojs/partytown) — Astro integration for Partytown to offload third-party scripts to a web worker.
* [@astrojs/preact](https://www.npmjs.com/package/@astrojs/preact) — Astro integration for rendering Preact islands/components.
* [@astrojs/react](https://www.npmjs.com/package/@astrojs/react) — Astro integration for rendering React components (can be paired with `preact/compat`).
* [@astrojs/sitemap](https://www.npmjs.com/package/@astrojs/sitemap) — Generates a `sitemap.xml` for your Astro site.
* [@nanostores/persistent](https://www.npmjs.com/package/@nanostores/persistent) — Persistence helpers for Nanostores (sync stores to `localStorage`, etc.).
* [@nanostores/react](https://www.npmjs.com/package/@nanostores/react) — React bindings for Nanostores (also works via `preact/compat`).
* [@radix-ui/react-slot](https://www.npmjs.com/package/@radix-ui/react-slot) — Radix UI Slot primitive for component composition.
* [@react-spring/web](https://www.npmjs.com/package/@react-spring/web) — Spring-physics animation library for the web.
* [@swup/astro](https://www.npmjs.com/package/@swup/astro) — Astro integration for Swup page transitions.
* [@tailwindcss/vite](https://www.npmjs.com/package/@tailwindcss/vite) — Tailwind CSS v4 Vite plugin for fast builds and HMR.
* [airtable](https://www.npmjs.com/package/airtable) — Airtable API client for Node.js/browser.
* [astro](https://www.npmjs.com/package/astro) — The Astro web framework (content-focused, islands architecture).
* [astro-capo](https://www.npmjs.com/package/astro-capo) — Automatically sorts/optimizes `<head>` tags with Capo.js for performance. ([npm][astro-capo-1])
* [astro-compressor](https://www.npmjs.com/package/astro-compressor) — Compress/minify HTML (and related) build output in Astro.
* [astro-critters](https://www.npmjs.com/package/astro-critters) — Integrates Critters to inline critical CSS and lazy-load the rest.
* [astro-favicons](https://www.npmjs.com/package/astro-favicons) — Generates favicons and related meta/link tags for Astro.
* [astro-font](https://www.npmjs.com/package/astro-font) — Font loading/optimization helpers for Astro (self-hosting, preload, etc.).
* [astro-lenis](https://www.npmjs.com/package/astro-lenis) — Astro integration for Lenis smooth scrolling.
* [astro-min](https://www.npmjs.com/package/astro-min) — Minifies/optimizes Astro build output.
* [astro-page-insight](https://www.npmjs.com/package/astro-page-insight) — Shows Lighthouse improvement hints directly on the page during development. ([GitHub][astro-page-insight-1])
* [astro-purgecss](https://www.npmjs.com/package/astro-purgecss) — Integrates PurgeCSS to remove unused CSS from builds.
* [astro-seo-meta](https://www.npmjs.com/package/astro-seo-meta) — Helpers for generating SEO meta tags in Astro.
* [astro-seo-schema](https://www.npmjs.com/package/astro-seo-schema) — Helpers for generating schema.org JSON-LD in Astro.
* [class-variance-authority](https://www.npmjs.com/package/class-variance-authority) — Define variant-driven class APIs for components.
* [classnames](https://www.npmjs.com/package/classnames) — Utility for conditionally joining `className` strings.
* [clsx](https://www.npmjs.com/package/clsx) — Tiny utility for conditional `className` joining (classnames alternative).
* [dotenv](https://www.npmjs.com/package/dotenv) — Loads environment variables from a `.env` file into `process.env`.
* [lenis](https://www.npmjs.com/package/lenis) — Smooth scrolling library.
* [less](https://www.npmjs.com/package/less) — LESS CSS preprocessor/compiler.
* [lodash](https://www.npmjs.com/package/lodash) — General-purpose JavaScript utility functions.
* [lucide-react](https://www.npmjs.com/package/lucide-react) — Lucide icon library as React components.
* [markdown-to-jsx](https://www.npmjs.com/package/markdown-to-jsx) — Render Markdown into JSX components.
* [minimist](https://www.npmjs.com/package/minimist) — Parse CLI arguments into an object.
* [nanostores](https://www.npmjs.com/package/nanostores) — Small, fast state manager for frameworks and vanilla JS.
* [onnxruntime-node](https://www.npmjs.com/package/onnxruntime-node) — Run ONNX machine-learning models in Node.js.
* [preact](https://www.npmjs.com/package/preact) — Fast, lightweight alternative to React.
* [purgecss](https://www.npmjs.com/package/purgecss) — Tool to remove unused CSS by scanning your content.
* [react-toggle-dark-mode](https://www.npmjs.com/package/react-toggle-dark-mode) — Ready-made dark mode toggle component for React.
* [schema-dts](https://www.npmjs.com/package/schema-dts) — TypeScript types for schema.org (JSON-LD).
* [sharp](https://www.npmjs.com/package/sharp) — High-performance image processing in Node.js.
* [smartcrop-sharp](https://www.npmjs.com/package/smartcrop-sharp) — Subject-aware cropping (Smartcrop) backed by Sharp.
* [tailwind-merge](https://www.npmjs.com/package/tailwind-merge) — Deduplicate/merge Tailwind class strings intelligently.
* [tailwindcss](https://www.npmjs.com/package/tailwindcss) — Utility-first CSS framework.

### Dev dependencies

* [@commitlint/cli](https://www.npmjs.com/package/@commitlint/cli) — CLI for enforcing conventional commit message rules.
* [@commitlint/config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional) — Shared conventional-commits config for commitlint.
* [@eslint/js](https://www.npmjs.com/package/@eslint/js) — ESLint’s official JavaScript rule/config package.
* [@kindspells/astro-shield](https://www.npmjs.com/package/@kindspells/astro-shield) — Security hardening for Astro (SRI, CSP, and more). ([Astro-Shield Docs][astro-shield-1])
* [@playform/inline](https://www.npmjs.com/package/@playform/inline) — Build-time helpers for inlining/optimizing assets (scripts/styles) in pages.
* [@tailwindcss/postcss](https://www.npmjs.com/package/@tailwindcss/postcss) — Tailwind CSS PostCSS plugin.
* [@unocss/reset](https://www.npmjs.com/package/@unocss/reset) — CSS reset presets from UnoCSS.
* [astro-devtool-breakpoints](https://www.npmjs.com/package/astro-devtool-breakpoints) — Devtool overlay to visualize responsive breakpoints in Astro.
* [astro-html-beautifier](https://www.npmjs.com/package/astro-html-beautifier) — Formats/beautifies generated HTML output.
* [astro-lighthouse](https://www.npmjs.com/package/astro-lighthouse) — Runs Lighthouse audits for Astro sites (often in CI).
* [astro-og](https://www.npmjs.com/package/astro-og) — Generate Open Graph images (OG) in Astro.
* [astro-relative-links](https://www.npmjs.com/package/astro-relative-links) — Transforms links to be relative (useful for static hosting).
* [astro-robots-txt](https://www.npmjs.com/package/astro-robots-txt) — Generates `robots.txt` for Astro sites.
* [astrojs-service-worker](https://www.npmjs.com/package/astrojs-service-worker) — Adds service worker/PWA support for Astro sites.
* [autoprefixer](https://www.npmjs.com/package/autoprefixer) — PostCSS plugin that adds vendor prefixes based on browser targets.
* [cspell](https://www.npmjs.com/package/cspell) — Spell checker for codebases and docs.
* [eslint](https://www.npmjs.com/package/eslint) — Pluggable JavaScript/TypeScript linter.
* [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier) — Turns off ESLint rules that conflict with Prettier.
* [eslint-import-resolver-typescript](https://www.npmjs.com/package/eslint-import-resolver-typescript) — Makes `eslint-plugin-import` resolve TS paths/`tsconfig`.
* [eslint-plugin-astro](https://www.npmjs.com/package/eslint-plugin-astro) — ESLint rules for `.astro` components.
* [eslint-plugin-eslint-comments](https://www.npmjs.com/package/eslint-plugin-eslint-comments) — Lint rules for ESLint directive comments.
* [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import) — ESLint rules for import/export syntax and style.
* [eslint-plugin-n](https://www.npmjs.com/package/eslint-plugin-n) — ESLint rules for Node.js best practices.
* [eslint-plugin-promise](https://www.npmjs.com/package/eslint-plugin-promise) — ESLint rules for Promise patterns.
* [eslint-plugin-regexp](https://www.npmjs.com/package/eslint-plugin-regexp) — ESLint rules for regular expressions.
* [eslint-plugin-sonarjs](https://www.npmjs.com/package/eslint-plugin-sonarjs) — Code-smell and maintainability rules (SonarJS).
* [eslint-plugin-tailwindcss](https://www.npmjs.com/package/eslint-plugin-tailwindcss) — Lint Tailwind classnames and ordering.
* [eslint-plugin-unicorn](https://www.npmjs.com/package/eslint-plugin-unicorn) — Modern, opinionated ESLint rules.
* [husky](https://www.npmjs.com/package/husky) — Git hooks manager (run checks on commit/push).
* [lint-staged](https://www.npmjs.com/package/lint-staged) — Run linters against staged git files pre-commit.
* [postcss](https://www.npmjs.com/package/postcss) — Tooling for transforming CSS with plugins.
* [postcss-html](https://www.npmjs.com/package/postcss-html) — PostCSS syntax/parser for HTML/template files.
* [prettier](https://www.npmjs.com/package/prettier) — Opinionated code formatter.
* [prettier-plugin-astro](https://www.npmjs.com/package/prettier-plugin-astro) — Prettier formatting support for `.astro` files.
* [sonda](https://www.npmjs.com/package/sonda) — Universal bundle analyzer/visualizer (interactive HTML reports). ([GitHub][sonda-1])
* [stylelint](https://www.npmjs.com/package/stylelint) — CSS/SCSS linter.
* [stylelint-config-standard](https://www.npmjs.com/package/stylelint-config-standard) — Standard shared config for Stylelint rules.
* [stylelint-config-tailwindcss](https://www.npmjs.com/package/stylelint-config-tailwindcss) — Stylelint config tuned for Tailwind projects.
* [stylelint-order](https://www.npmjs.com/package/stylelint-order) — Stylelint plugin to enforce ordering conventions.
* [tw-animate-css](https://www.npmjs.com/package/tw-animate-css) — Animation utilities intended for Tailwind workflows.
* [typescript](https://www.npmjs.com/package/typescript) — TypeScript language and compiler.
* [typescript-eslint](https://www.npmjs.com/package/typescript-eslint) — ESLint tooling for TypeScript (parser + rules).
* [unocss](https://www.npmjs.com/package/unocss) — On-demand utility-first CSS engine (Tailwind-like).

### Overrides

* **`react` / `react-dom` → `@preact/compat`** — forces React imports to resolve to Preact compatibility layer (smaller runtime, React-like API).

[astro-1]: https://astro.build/blog/astro-580/ "Astro 5.8"
[netlify-1]: https://cli.netlify.com/commands/deploy/ "Netlify CLI deploy command"
[astro-capo-1]: https://www.npmjs.com/package/astro-capo?activeTab=versions&utm_source=chatgpt.com "astro-capo"
[astro-page-insight-1]: https://github.com/ktym4a/astro-page-insight "ktym4a/astro-page-insight"
[astro-shield-1]: https://astro-shield.kindspells.dev/ "Welcome to Astro-Shield | Astro-Shield Docs"
[sonda-1]: https://github.com/filipsobol/sonda "filipsobol/sonda: Universal visualizer and analyzer for ..."

---

## Recommended development environment

We recommend using **Zed** as the primary editor for this repository: it’s fast, has excellent LSP-based editing, and includes **native Git workflows** (diffs, staging, committing, pulling/pushing, etc.) directly in the editor. ([Zed][zed-1])

### Suggested Zed extensions

Install these from Zed’s Extensions view (Command Palette → `zed: extensions`). ([Zed][zed-2])

#### Language support & syntax highlighting

* **Astro** — syntax highlighting + language tooling for `.astro` files. ([Zed][zed-3])
* **ini** — improves editing for `.ini`-style config files (and related formats like `.editorconfig`). ([Zed][zed-4])
* **env** — better highlighting/handling for `.env` files and environment-style configs. ([Zed][zed-5])

#### Linting, diagnostics, and formatting

* **Stylelint** — CSS/SCSS/Astro/HTML style diagnostics and auto-fix support. ([Zed][zed-6])
* **ESLint (built-in via language tooling)** — Zed can run ESLint fix actions on format/save for JS/TS when configured. ([Zed][zed-7])
* **Prettier (external formatter)** — Zed supports running Prettier as an external formatter using `--stdin-filepath` so it formats based on file type. ([Zed][zed-8])
* **Tailwind CSS (built-in)** — Tailwind autocomplete / hover / linting is supported in Zed (including in Astro and JSX/TSX contexts). ([Zed][zed-9])

#### Git / CI awareness & repo hygiene

* **GitHub Actions** — nicer editing/validation for workflow files. ([Zed][zed-10])
* **NPM Package.json Update Checker** — highlights outdated dependencies directly in `package.json` and can surface changelogs. ([Zed][zed-11])

#### Docs & writing quality

* **Codebook Spell Checker** *(or CSpell)* — spell checking that works well for code, comments, and Markdown. ([Zed][zed-12])
* **Markdown Oxide** *(optional)* — extra Markdown “knowledge base / linking” workflows if you maintain lots of docs/notes. ([Zed][zed-13])

---

### Optional: a minimal Zed setup for this repo

If you want “format on save” to behave like this repo’s tooling (Prettier + ESLint fixes), Zed supports both **external formatters** and **ESLint code actions**:

```jsonc
// Zed settings.json (example)
{
  // Run Prettier as the formatter (reads from stdin, writes to stdout)
  "formatter": {
    "external": {
      "command": "prettier",
      "arguments": ["--stdin-filepath", "{buffer_path}"]
    }
  },

  // Apply ESLint fixes when formatting JS/TS
  "languages": {
    "JavaScript": {
      "code_actions_on_format": { "source.fixAll.eslint": true }
    },
    "TypeScript": {
      "code_actions_on_format": { "source.fixAll.eslint": true }
    }
  }
}
```

(These patterns come straight from Zed’s formatter + JavaScript/ESLint docs.) ([Zed][zed-8])

[zed-1]: https://zed.dev/git "Native Git Support"
[zed-2]: https://zed.dev/extensions "Zed Extensions"
[zed-3]: https://zed.dev/extensions/astro "Astro Extension"
[zed-4]: https://zed.dev/extensions/ini "ini — Zed Extension"
[zed-5]: https://zed.dev/extensions/env "env — Zed Extension"
[zed-6]: https://zed.dev/extensions/stylelint "Stylelint — Zed Extension"
[zed-7]: https://zed.dev/docs/languages/javascript "JavaScript | Zed Code Editor Documentation"
[zed-8]: https://zed.dev/docs/configuring-zed "Configuring Zed | Zed Code Editor Documentation"
[zed-9]: https://zed.dev/docs/languages/tailwindcss "Tailwind CSS | Zed Code Editor Documentation"
[zed-10]: https://zed.dev/extensions/github-actions "GitHub Actions Extension"
[zed-11]: https://zed.dev/extensions/npm-package-json-checker "NPM Package.json Update Checker Extension"
[zed-12]: https://zed.dev/extensions/codebook "Codebook Spell Checker Extension"
[zed-13]: https://zed.dev/extensions/markdown-oxide "Markdown Oxide Extension"
