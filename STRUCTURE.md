# Project structure

site/
├─ public/                         # Static assets served as-is (not included in this upload)
│  ├─ attachments/                 # Generated responsive image derivatives + manifest.json per attachment (used by Img.astro)
│  ├─ og/                          # Pre-rendered Open Graph images (if present)
│  └─ fonts/                       # Font files (if present)
├─ src/
│  ├─ pages/                       # Route-based pages (.astro)
│  │  ├─ index.astro               # Homepage route (/) rendered inside the main layout.
│  │  ├─ index-page.astro          # Secondary placeholder page (simple route scaffold).
│  │  ├─ articles.astro            # Lists all articles from the Astro content collection and links to their slugs.
│  │  ├─ [...article].astro        # Catch-all article route; statically generates pages from the articles collection and renders cover + body.
│  │  └─ search.astro              # Placeholder Search page route.
│  ├─ layouts/
│  │  └─ main.astro                # Global HTML shell: imports global LESS, renders Header/Footer, and prewarms content collections.
│  ├─ components/
│  │  ├─ article/
│  │  │  ├─ Content.astro          # Article body renderer; passes the record’s `text` into the Markdown renderer.
│  │  │  └─ Markdown.jsx           # React Markdown renderer using markdown-to-jsx (renders Airtable-provided markdown strings).
│  │  ├─ footer/
│  │  │  └─ Footer.astro           # Footer markup; includes a Settings button that opens the Glider panel via `openGlider(...)`.
│  │  ├─ header/
│  │  │  ├─ Header.astro           # Header navigation and mounts the Toolbar + Glider islands.
│  │  │  ├─ toolbar/
│  │  │  │  ├─ Toolbar.astro       # Astro wrapper that mounts the React toolbar client-side.
│  │  │  │  ├─ ToolbarFX.jsx       # Toolbar logic (theme + dark mode toggles) wired to Nanostores persistent state.
│  │  │  │  └─ YinYang.jsx         # Yin-yang SVG icon used for the theme toggle UI.
│  │  │  └─ glider/
│  │  │     ├─ Glider.astro        # Astro wrapper that boots the React Glider panel client-side.
│  │  │     ├─ GliderBootup.jsx    # Lazy bootloader: mounts Glider after load/idle and replays early open events.
│  │  │     ├─ GliderFX.jsx        # Accessible sliding side panel (portal) with animations, focus trapping, and panel registry.
│  │  │     ├─ Close.jsx           # Close icon SVG for the Glider header button.
│  │  │     └─ panels/
│  │  │        ├─ Settings.jsx     # Settings panel UI (theme, day/night, font size) powered by Nanostores.
│  │  │        └─ Sizer.jsx        # SVG used to visualize and pick font-size “rings”.
│  │  ├─ img/
│  │  │  └─ Img.astro              # Responsive image component: reads /public/attachments/<id>/manifest.json, builds <picture> srcsets, uses palette bg + optional focus.
│  │  ├─ ui/
│  │  │  └─ button.tsx             # Shared Button component (Radix Slot + class-variance-authority variants + cn()).
│  │  └─ seo/                      # Reserved for SEO components (empty in this snapshot).
│  ├─ content/                     # Astro Content Collections (source of truth)
│  │  ├─ config.ts                 # defineCollection() schemas + glob loader for JSON article records.
│  │  ├─ articles/
│  │  │  ├─ recAcGPVpS0JV8BSv.json  # Example article record synced from Airtable (cover, slug, status, text, etc.).
│  │  │  └─ recjyejYj1K2Y5tnM.json  # Example article record synced from Airtable (cover, slug, status, text, etc.).
│  ├─ data/                        # Reserved for JSON/YAML site data (empty in this snapshot).
│  ├─ lib/
│  │  ├─ build-cache.js            # Memoized wrapper over astro:content getCollection; freezes results for stability.
│  │  ├─ prewarm-collections.js    # One-time warmup for collections to reduce repeated reads during render/build.
│  │  └─ utils.ts                  # cn() helper: clsx + tailwind-merge to compose Tailwind class strings.
│  ├─ store/
│  │  └─ theme.ts                  # Persistent Nanostores atoms for day/night mode, theme, and font size (+ setters/cyclers).
│  ├─ styles/
│  │  ├─ index.less                # Global style entrypoint imported by the main layout (pulls in all style modules).
│  │  ├─ reset.less                # Base reset + text rendering defaults (balance/pretty wrap, hyphenation, etc.).
│  │  ├─ themes.less               # Theme tokens (CSS variables) + night-mode overrides per theme.
│  │  ├─ type.less                 # Base link/button typography styling for `.linklike` and anchors.
│  │  ├─ img.less                  # Image wrapper styles for `.x-img` + shimmer placeholder helpers.
│  │  ├─ grid.less                 # Grid utilities (e.g., `.grid.PX240-AUTO` layout used on article pages).
│  │  ├─ glider.less               # Glider overlay/backdrop/panel styles.
│  │  ├─ container.less            # `.container` layout sizing and spacing utilities.
│  │  ├─ header.less               # Header navigation + toolbar + settings UI styling.
│  │  ├─ footer.less               # Footer layout, spacing, and border styling.
│  │  ├─ layout.less               # Overall page layout skeleton (flex column, main grows, etc.).
│  │  └─ fixtures.less             # Breakpoint scaffolding/placeholders for future viewport-specific tweaks.
│  ├─ cspell.config.json           # Spell checker configuration (dictionaries, ignore paths, filetypes, project words).
│  ├─ uno.config.js                # UnoCSS configuration stub (optional; currently minimal).
└─ …
