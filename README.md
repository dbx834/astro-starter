## Quick start

### Prerequisites

* **Node.js:** use **Node 20.3+** (Astro 5.x has moved its minimum Node requirement up to 20.3+). ([Astro][1])
* **Package manager:** `pnpm` (scripts below assume pnpm).

### Install

```bash
# install dependencies
pnpm install
```

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

Netlify CLI’s `deploy` command creates a draft deploy by default; `--prod` deploys to your live site. ([Netlify CLI command reference][2])

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
* [astro-capo](https://www.npmjs.com/package/astro-capo) — Automatically sorts/optimizes `<head>` tags with Capo.js for performance. ([npm][3])
* [astro-compressor](https://www.npmjs.com/package/astro-compressor) — Compress/minify HTML (and related) build output in Astro.
* [astro-critters](https://www.npmjs.com/package/astro-critters) — Integrates Critters to inline critical CSS and lazy-load the rest.
* [astro-favicons](https://www.npmjs.com/package/astro-favicons) — Generates favicons and related meta/link tags for Astro.
* [astro-font](https://www.npmjs.com/package/astro-font) — Font loading/optimization helpers for Astro (self-hosting, preload, etc.).
* [astro-lenis](https://www.npmjs.com/package/astro-lenis) — Astro integration for Lenis smooth scrolling.
* [astro-min](https://www.npmjs.com/package/astro-min) — Minifies/optimizes Astro build output.
* [astro-page-insight](https://www.npmjs.com/package/astro-page-insight) — Shows Lighthouse improvement hints directly on the page during development. ([GitHub][4])
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
* [@kindspells/astro-shield](https://www.npmjs.com/package/@kindspells/astro-shield) — Security hardening for Astro (SRI, CSP, and more). ([Astro-Shield Docs][5])
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
* [sonda](https://www.npmjs.com/package/sonda) — Universal bundle analyzer/visualizer (interactive HTML reports). ([GitHub][6])
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

[1]: https://astro.build/blog/astro-580/?utm_source=chatgpt.com "Astro 5.8"
[2]: https://cli.netlify.com/commands/deploy/?utm_source=chatgpt.com "Netlify CLI deploy command"
[3]: https://www.npmjs.com/package/astro-capo?activeTab=versions&utm_source=chatgpt.com "astro-capo"
[4]: https://github.com/ktym4a/astro-page-insight?utm_source=chatgpt.com "ktym4a/astro-page-insight"
[5]: https://astro-shield.kindspells.dev/?utm_source=chatgpt.com "Welcome to Astro-Shield | Astro-Shield Docs"
[6]: https://github.com/filipsobol/sonda?utm_source=chatgpt.com "filipsobol/sonda: Universal visualizer and analyzer for ..."

---
## Recommended development environment

We recommend using **Zed** as the primary editor for this repository: it’s fast, has excellent LSP-based editing, and includes **native Git workflows** (diffs, staging, committing, pulling/pushing, etc.) directly in the editor. ([Zed][1])

### Suggested Zed extensions

Install these from Zed’s Extensions view (Command Palette → `zed: extensions`). ([Zed][2])

#### Language support & syntax highlighting

* **Astro** — syntax highlighting + language tooling for `.astro` files. ([Zed][3])
* **ini** — improves editing for `.ini`-style config files (and related formats like `.editorconfig`). ([Zed][2])
* **env** — better highlighting/handling for `.env` files and environment-style configs. ([Zed][4])

#### Linting, diagnostics, and formatting

* **Stylelint** — CSS/SCSS/Astro/HTML style diagnostics and auto-fix support. ([Zed][5])
* **ESLint (built-in via language tooling)** — Zed can run ESLint fix actions on format/save for JS/TS when configured. ([Zed][6])
* **Prettier (external formatter)** — Zed supports running Prettier as an external formatter using `--stdin-filepath` so it formats based on file type. ([Zed][7])
* **Tailwind CSS (built-in)** — Tailwind autocomplete / hover / linting is supported in Zed (including in Astro and JSX/TSX contexts). ([Zed][8])

#### Git / CI awareness & repo hygiene

* **GitHub Actions** — nicer editing/validation for workflow files. ([Zed][9])
* **NPM Package.json Update Checker** — highlights outdated dependencies directly in `package.json` and can surface changelogs. ([Zed][10])

#### Docs & writing quality

* **Codebook Spell Checker** *(or CSpell)* — spell checking that works well for code, comments, and Markdown. ([Zed][11])
* **Markdown Oxide** *(optional)* — extra Markdown “knowledge base / linking” workflows if you maintain lots of docs/notes. ([Zed][12])

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

(These patterns come straight from Zed’s formatter + JavaScript/ESLint docs.) ([Zed][7])

[1]: https://zed.dev/git?utm_source=chatgpt.com "Native Git Support"
[2]: https://zed.dev/extensions/ini?utm_source=chatgpt.com "ini — Zed Extension"
[3]: https://zed.dev/extensions/astro?utm_source=chatgpt.com "Astro Extension"
[4]: https://zed.dev/extensions/env?utm_source=chatgpt.com "env — Zed Extension"
[5]: https://zed.dev/extensions/stylelint?utm_source=chatgpt.com "Stylelint — Zed Extension"
[6]: https://zed.dev/docs/languages/javascript?utm_source=chatgpt.com "JavaScript | Zed Code Editor Documentation"
[7]: https://zed.dev/docs/configuring-zed?utm_source=chatgpt.com "Configuring Zed | Zed Code Editor Documentation"
[8]: https://zed.dev/docs/languages/tailwindcss?utm_source=chatgpt.com "Tailwind CSS | Zed Code Editor Documentation"
[9]: https://zed.dev/extensions/github-actions?utm_source=chatgpt.com "GitHub Actions Extension"
[10]: https://zed.dev/extensions/npm-package-json-checker?utm_source=chatgpt.com "NPM Package.json Update Checker Extension"
[11]: https://zed.dev/extensions/codebook?utm_source=chatgpt.com "Codebook Spell Checker Extension"
[12]: https://zed.dev/extensions/markdown-oxide?utm_source=chatgpt.com "Markdown Oxide Extension"

---

## Airtable sync + responsive media pipeline

This repository includes a small suite of Node/ESM scripts that let you use **Airtable as a lightweight CMS**, then **compile Airtable records into Astro-friendly content**, and finally **turn Airtable attachments into a fully responsive image set** (multiple formats + multiple sizes) that the browser can pick from automatically.

You can find this under `/scripts/airtable-sync`

### What this suite does

* **`n0-clean.mjs`**: clears previously generated local JSON so you can do a clean regeneration when needed.
* **`n1-sync.mjs`**: pulls records from Airtable and writes **normalized JSON files** into your Astro content folder (for example `src/content/articles/<recordId>.json`). It also supports *incremental sync* by only querying records changed since the last run (based on a “Last modified” field + a cached checkpoint), and it only rewrites local JSON files when the record’s data actually changed—keeping diffs clean and rebuilds fast.
* **`n2-images.mjs`**: scans the generated JSON for attachment fields (e.g. covers/attachments), downloads originals, and generates **responsive derivatives** plus a **`manifest.json`** per image (sources, dimensions, placeholder, palette, and focus point).

This workflow makes Airtable feel like a CMS: data workers and editors work in Airtable, the site pulls a clean export, and each new edit can be iterated quickly by re-running the sync + media steps and rebuilding Astro.

### Airtable as CMS: “export view” + field hygiene

The sync step is intentionally strict:

* **Only the Airtable `PUBLISHED` view is synced**. That view becomes your explicit “export surface” for the website.
* **Fields starting with `_` are ignored** by the sync pipeline. This is a simple but powerful convention: anything you want to keep *only* in Airtable (internal notes, admin fields, intermediate workflow helpers) can be prefixed with `_` and it won’t be carried forward into the site’s content JSON.
* The script also ignores fields that end with `?`, which is useful for question-style helper columns you may not want downstream.

In practice, this gives you a clean separation between:

* **Airtable-only fields** (prefixed with `_` or `?`) for internal workflow, and
* **website-eligible fields** (everything else) that can safely flow into your Astro build.

### Publishing workflow: Published vs Draft vs Hold

A good way to run the content lifecycle is:

* **Published** → visible on the website and linked publicly (included in listings/navigation).
* **Draft** → generated and reachable if you know the URL, but **not linked publicly** (unlisted).
* **Hold** → never leaves Airtable.

A common pattern is to define the Airtable **`PUBLISHED` view** as “everything except Hold” (so it includes Published + Draft), and then have the site’s templates decide whether to link/list items based on the record’s status.

### Responsive images: multiple sizes, modern formats, fully automated

The image pipeline is designed around how modern responsive images are served on the web:

* For each original image, derivatives are generated at multiple widths (a `srcset`-style set), and in multiple formats (**AVIF**, **WebP**, **JPEG**).
* A `manifest.json` is written per image containing:

  * intrinsic `width`, `height`, `aspectRatio`
  * per-format source lists (so you can render `<picture>` / `<source type="image/avif"> …`)
  * a tiny **base64 LQIP** placeholder and a **dominant color palette**
  * an ML-derived **focus point** (with SmartCrop fallback), useful for consistent cropping and object-positioning across breakpoints

This maps directly onto established responsive image best practices:

* Use `srcset`/`sizes` so the browser can pick the most appropriate resource for viewport and pixel density. ([MDN Web Docs][1])
* Use `<picture>` to offer multiple formats (e.g., AVIF/WebP fallbacks) and enable more explicit source selection. ([MDN Web Docs][2])
* Prefer modern formats like AVIF/WebP when possible for better compression efficiency (while keeping fallbacks). ([MDN Web Docs][3])

The key advantage here is that **all source material generation is automated**: editors attach an image in Airtable, and the scripts handle downloading, resizing, transcoding, and emitting manifests that your Astro components can consume—making “responsive media composition” a build-time concern rather than manual editorial work.

[1]: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images?utm_source=chatgpt.com "Using responsive images in HTML - MDN Web Docs"
[2]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture?utm_source=chatgpt.com "The Picture element - HTML - MDN Web Docs"
[3]: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types?utm_source=chatgpt.com "Image file type and format guide - Media - MDN Web Docs"
