site/
├─ public/ # Static assets served as-is (favicon, robots.txt)
│ ├─ og/ # Pre-rendered Open Graph images
│ └─ fonts/
├─ src/
│ ├─ pages/ # Route-based pages (.astro)
│ │ ├─ index.astro
│ │ ├─ [article].astro
│ │ ├─ articles.astro
│ │ ├─ index-page.astro
│ │ └─ api/ # Server endpoints (Astro endpoints)
│ ├─ layouts/
│ │ ├─ main.astro
│ ├─ components/
│ │ ├─ article/
│ │ ├─ header/
│ │ ├─ footer/
│ │ ├─ img/
│ │ ├─ seo/
│ │ ├─ ui/
│ ├─ content/ # Astro Content Collections (source of truth)
│ │ ├─ config.ts # defineCollection() schemas
│ │ ├─ articles/ # MD/MDX with frontmatter
│ │ │ └─ [recordID].json
│ ├─ data/ # JSON/YAML that powers pages (if not in content/)
│ │ ├─ menus.json
│ │ └─ redirects.yaml
│ ├─ lib/ # Reusable utilities (no DOM)
│ │ └─ utils.ts
│ ├─ styles/
│ │ ├─ container.less #
│ │ ├─ fixture.less #
│ │ ├─ footer.less #
│ │ ├─ glider.less #
│ │ ├─ grid.less #
│ │ ├─ header.less #
│ │ ├─ img.less #
│ │ ├─ layout.less #
│ │ ├─ reset.less #
│ │ ├─ themes.less #
│ │ ├─ type.less #
│ ├─ assets/ # Build-pipeline assets (processed by Vite)
│ │ ├─ images/
│ │ └─ icons/
│ ├─ scripts/ # Node scripts (build-time tasks, migrations)
│ │ ├─ generate-redirects.mjs
│ │ └─ import-from-cms.mjs
│ ├─ middleware/ # (optional) Astro middleware
│ │ └─ index.ts
│ └─ env.d.ts # Type augmentations (e.g., import.meta.env)
├─ .vscode/ # Editor settings (formatting, paths)
├─ .github/
│ └─ workflows/ci.yml # Lint/build/deploy
├─ astro.config.mjs
├─ tsconfig.json
├─ package.json
└─ README.md
