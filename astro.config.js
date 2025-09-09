// astro.config.mjs
import { defineConfig } from "astro/config";

// Framework
import preact from "@astrojs/preact";

// Styling
import tailwind from "@tailwindcss/vite";

// HTML/meta
import og from "astro-og";
import relativeLinks from "astro-relative-links";
import partytown from "@astrojs/partytown";

// Build/optimize (choose ONE minifier; keeping compressor)
import compressor from "astro-compressor";

// DX (dev)
import lighthouse from "astro-lighthouse";
import htmlBeautifier from "astro-html-beautifier";
import astroDevToolBreakpoints from "astro-devtool-breakpoints";
import pageInsight from "astro-page-insight";

// SEO & PWA
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import serviceWorker from "astrojs-service-worker";

// Client transitions
import swup from "@swup/astro";

// Security
import { shield } from "@kindspells/astro-shield";

// ❯ Environment flags
const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

import lenis from "astro-lenis";

export default defineConfig({
  site: "https://www.website.com",
  prefetch: true,

  integrations: [
    // 1) Runtime
    preact({ compat: true }), // use { compat: true } only if needed

    lenis(),

    // 2) HTML/meta
    og(),
    relativeLinks(),
    partytown({
      config: { forward: ["dataLayer.push"] },
      // optional: resolveUrl / debug: true in dev
    }),

    // 3) DX (dev-only)
    ...(isDev
      ? [
          lighthouse(),
          htmlBeautifier(),
          astroDevToolBreakpoints(),
          pageInsight(),
        ]
      : []),

    // 4) Optimizers (prod-only)
    ...(isProd ? [compressor()] : []),
    // If you really need @playform/inline, prefer scoping:
    // ...(isProd ? [inline({ images: false, scripts: false, styles: false, fonts: true })] : []),

    // 5) SEO & PWA (prod-only)
    ...(isProd
      ? [
          sitemap(),
          robotsTxt({
            policy: [{ userAgent: "*", allow: "/" }],
            sitemap: "https://www.website.com/sitemap-index.xml",
          }),
          serviceWorker(),
        ]
      : [serviceWorker()]),

    // 6) Client transitions (usually both envs)
    swup(),

    // 7) Security (both envs; stricter in prod)
    shield({
      csp: {
        // Start relaxed; tighten when scripts settled
        "default-src": ["'self'"],
        "script-src": ["'self'", "https:", "'unsafe-inline'"], // remove 'unsafe-inline' after migrating to nonces
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'", "https:"],
        "frame-src": ["https:"],
        upgradeInsecureRequests: isProd,
        reportOnly: isDev,
      },
      securityHeaders: {
        referrerPolicy: "strict-origin-when-cross-origin",
        frameOptions: "SAMEORIGIN",
        xssProtection: "0", // modern browsers rely on CSP
        hidePoweredBy: true,
        hsts: isProd
          ? { maxAge: 15552000, includeSubDomains: true, preload: false }
          : false,
      },
    }),
  ],

  vite: {
    plugins: [tailwind()],
    build: {
      sourcemap: isDev,
    },
  },

  build: {
    inlineStylesheets: "auto",
  },
});
