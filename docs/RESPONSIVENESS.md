# Responsive development

## Media-aware breakpoint classes (`media-aware.js`)

`public/scripts/media-aware.js` is a tiny client-side utility that watches the viewport (via `matchMedia`) and keeps the `<body>` tagged with a **stable set of breakpoint / orientation / device classes**. It adds a `media-aware` marker class plus **exactly one width class** (`x-w-xxl | x-w-xl | x-w-lg | x-w-md | x-w-sm | x-w-xs`), **one height class** (`x-h-…`), and flags like `x-is-portrait`, `x-is-landscape`, and `x-is-retina`. Updates are throttled (default ~1000ms, configurable via `window.MEDIA_AWARE_OPTIONS.minIntervalMs`), and it’s Astro-aware: it detaches/re-attaches around `astro:before-swap` / `astro:after-swap` so classes stay correct during client-side navigation. Optionally, it can also write a set of `data-*` attributes onto `<body>` for debugging/inspection, and it emits a `media-state:update` event with the computed state.

### `fixtures.less` and “styling by classes”

`src/styles/fixtures.less` is your **breakpoint styling scaffold**: it mirrors the classes that `media-aware.js` applies and gives you a single place to define global breakpoint overrides **without writing media queries**. Because the classes land on `body#meta`, you can express responsive rules as simple selectors like `body#meta.x-w-xs { … }` or `body#meta.x-w-md.x-is-portrait { … }`. This makes responsiveness very explicit and easy to debug: if a layout looks wrong, you can immediately see which breakpoint class is active and tune the corresponding block.

#### Example 1: collapse the two-column article grid on small screens

```less
/* src/styles/fixtures.less */

html#meta {
  body#meta {
    &.x-w-sm,
    &.x-w-xs {
      .grid.PX240-AUTO {
        grid-template-columns: 1fr;

        > div {
          &:nth-child(2) {
            border-left: 0;
            padding-left: 0;
          }
        }
      }
    }
  }
}
```

#### Example 2: stack the header nav on phones

```less
/* src/styles/fixtures.less */

html#meta {
  body#meta {
    &.x-w-xs {
      header#meta {
        .container > ul {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }
      }
    }
  }
}
```
