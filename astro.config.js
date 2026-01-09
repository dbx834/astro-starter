// astro.config.mjs
import { defineConfig } from "astro/config";

// Framework
import react from "@astrojs/react";
import preact from "@astrojs/preact";

// Styling
import tailwind from "@tailwindcss/vite";

// HTML/meta
import og from "astro-og";
import relativeLinks from "astro-relative-links";
import partytown from "@astrojs/partytown";
import { astroFont } from "astro-font/integration";

// Build/optimize
// import compressor from 'astro-compressor'

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

// Favicons
import favicons from "astro-favicons";

// import compress from "@playform/compress";

// import suppressNativeWarnings from "./tools/suppress-native-warnings.mjs";
// import selectiveMangle from "./tools/vite-selective-mangle.mjs";

import critters from "astro-critters";

// Env flags
const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

// Optional flag to generate OG images only when needed
const genOg = process.env.GEN_OG === "1";

export default defineConfig({
  site: "https://auroville.today/",
  prefetch: true,
  // compressHTML: true, // Handled by @playform/compress

  integrations: [
    // 0) Animations
    swup(),

    // 1) Runtime
    // react(),
    ...(isProd
      ? [preact({ compat: true })]
      : [preact({ compat: true, devtools: true })]),
    favicons({ input: { favicons: ["public/logos/logo.png"] } }),

    // 2) HTML/meta
    ...(genOg ? [og()] : []), // gate OG work; flip on via GEN_OG=1
    // relativeLinks(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    astroFont(),

    ...(isProd
      ? [
          critters({
            preload: "swap",
            pruneSource: true,
            reduceInlineStyles: true,
            logger: 0,
          }),
        ]
      : []),

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
    // ...(isProd ? [compressor()] : []),

    // 5) SEO & PWA (prod-only)
    ...(isProd
      ? [
          sitemap(),
          robotsTxt({
            policy: [{ userAgent: "*", allow: "/" }],
            sitemap: "https://auroville.today/sitemap-index.xml",
          }),
          serviceWorker(), // prod only
        ]
      : []),

    // 7) Security (prod-only to keep dev simpler/faster)
    ...(isProd
      ? [
          shield({
            csp: {
              "default-src": ["'self'"],
              "script-src": ["'self'", "https:", "'unsafe-inline'"],
              "style-src": ["'self'", "https:", "'unsafe-inline'"],
              "img-src": ["'self'", "data:", "https:"],
              "connect-src": ["'self'", "https:"],
              "frame-src": ["'self'", "https:"],
              "worker-src": ["'self'"],
              upgradeInsecureRequests: true,
              reportOnly: false,
            },
            securityHeaders: {
              referrerPolicy: "strict-origin-when-cross-origin",
              frameOptions: "SAMEORIGIN",
              xssProtection: "0",
              hidePoweredBy: true,
              hsts: {
                maxAge: 15552000,
                includeSubDomains: true,
                preload: false,
              },
            },
          }),
        ]
      : []),

    // suppressNativeWarnings(),

    // 8) Post-build minification/compression — MUST be last
    // ...(isProd
    //   ? [
    //       compress({
    //         // Turn on HTML minification + minify inline CSS/JS
    //         HTML: {
    //           'html-minifier-terser': {
    //             collapseWhitespace: true,
    //             removeComments: true,
    //             removeRedundantAttributes: true,
    //             removeEmptyAttributes: true,
    //             useShortDoctype: true,
    //             minifyCSS: true, // inline <style>
    //             minifyJS: true, // inline <script>
    //           },
    //         },
    //         // If you also want extra-aggressive JS/CSS file minification post-build, enable these:
    //         // JavaScript: { terser: { format: { comments: false } } },
    //         // CSS: { csso: { comments: false } },
    //         // SVG: { svgo: {} },
    //         // JSON: true,
    //         // Image: false,
    //         Logger: 2,
    //         // Exclude: [
    //         //   /(?:^|[\\/])attachments[\\/].*/i,
    //         //   /(?:^|[\\/])attachments[\\/].+\.json$/i,
    //         //   /(?:^|[\\/])files[\\/].*/i,
    //         //   /(?:^|[\\/])files[\\/].+\.json$/i,
    //         //   /\.(avif|avifs|webp|png|jpe?g|gif|tiff|heic|heif|apng|jfif|jif|jpe|raw)$/i,
    //         // ],
    //       }),
    //     ]
    //   : []),
  ],

  // ✅ All Vite options live under this key
  vite: {
    plugins: [
      tailwind(),
      {
        name: "silence-installhook-sourcemap",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/installHook.js.map") {
              res.statusCode = 204;
              res.end();
              return;
            }
            next();
          });
        },
      },
      // selectiveMangle({ include: [/\/src\/mangle\/.*\.(js|mjs|ts)$/] }),
    ],

    // ---- Build (Vite/Rollup) ----
    build: {
      sourcemap: isDev,

      // Keep the fast path
      minify: "esbuild",
      target: "es2020",
      cssCodeSplit: true,
      assetsInlineLimit: 0,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,

      rollupOptions: {
        output: {
          // ⚠️ chunk only real, heavy libs you use
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-virtualized": ["react-virtualized"],
            "vendor-search": ["algoliasearch/lite", "react-instantsearch-dom"],
            "vendor-ui": [
              "@radix-ui/react-accordion",
              "@radix-ui/react-popover",
              "@radix-ui/react-tabs",
              "class-variance-authority",
              "clsx",
            ],
            "vendor-utils": ["lodash", "nanostores"],
          },
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
        inlineDynamicImports: false,
        treeshake: {
          moduleSideEffects: "no-external",
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
    },

    // build: { cssMinify: 'lightningcss' },
    // css: { transformer: 'lightningcss', lightningcss: {} },

    // ---- Dep pre-bundle ----
    optimizeDeps: {
      include: ["react", "react-dom"],
      // exclude: [
      //   "@swup/astro", // runtime integration, no need to prebundle
      // ],
      esbuildOptions: {
        target: "es2020",
        legalComments: "none",
        keepNames: false,
      },
    },

    // ---- Resolve / Dedupe ----
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@/": "/src/",
      },
    },

    // ---- Esbuild transform defaults ----
    esbuild: {
      target: "es2020",
      legalComments: "none",
      jsx: "automatic",
      drop: isProd ? ["console", "debugger"] : [],
    },

    // ---- Define constants to prune dev branches ----
    define: {
      __DEV__: JSON.stringify(isDev),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "import.meta.vitest": "undefined",
    },

    // ---- CSS (keep defaults fast) ----
    css: {
      devSourcemap: false,
    },
  },

  // ✅ Astro’s top-level build options only
  build: {
    inlineStylesheets: "auto",
    // (do not place vite/rollup options here)
  },
});
