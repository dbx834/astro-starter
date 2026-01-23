# SEO components overview

This project’s SEO system is built as a small set of **Astro components** that emit:

- **classic meta tags** (title, description, canonical, robots, OG, Twitter, hreflang)
- **structured data (JSON-LD)** for key schema.org entities like `WebSite`, `Organization`, `WebPage`, `BreadcrumbList`, and `Article`.

Google generally recommends **JSON-LD** for structured data because it’s easier to implement and maintain at scale. :contentReference[oaicite:0]{index=0}  
You can validate what you’re emitting with Google’s Rich Results Test. :contentReference[oaicite:1]{index=1}

---

## Files

- `Basic.astro` — Meta tags (HTML `<head>`), Open Graph, Twitter cards, hreflang.
- `Breadcrumbs.astro` — `BreadcrumbList` JSON-LD generator.
- `Organisation.astro` — `Organization` + `NewsMediaOrganization` JSON-LD (publisher identity + newsroom policy links).
- `Website.astro` — minimal `WebSite` JSON-LD (cross-linked to the publisher).
- `Webpage.astro` — “page bundle” JSON-LD: `Organization` + `WebSite` + `WebPage` (+ optional breadcrumbs).
- `SiteNavigationElement.astro` — hierarchical nav JSON-LD using `SiteNavigationElement` + `hasPart`. :contentReference[oaicite:2]{index=2}
- `Article.astro` — `Article` JSON-LD with optional keywords/mentions blocks; designed for editorial pages and “mentions people” enrichment. :contentReference[oaicite:3]{index=3}

---

## `Basic.astro`

### What it does
Emits the **standard SEO meta tags** and social sharing tags in the `<head>`:

- `<title>`
- `<meta name="description">`
- canonical `<link rel="canonical">`
- `<meta name="robots">`
- Open Graph tags (`og:*`) for link previews
- Twitter card tags
- `rel="alternate" hreflang="..."` links (for multilingual sites)

### Props (options)
All props are optional; sensible defaults come from `@/data/website.json`.

**Primary / page-level**
- `title?: string`  
  Page title. Rendered as `"{title} | {siteTitle}"` when provided.
- `description?: string`  
  Used for meta description and OG/Twitter description (trimmed to 300 chars).
- `pathname?: string`  
  Used to build canonical URL (relative path like `/articles/foo`).
- `image?: string`  
  Used as Open Graph + Twitter image (relative or absolute).
- `robots?: string` (default: `"index,follow"`)  
  Passed into `<meta name="robots" ...>`.
- `articleType?: string`  
  If provided, sets `og:type` to `"article"` (otherwise `"website"`).
- `publishedTime?: string`  
  Emits `article:published_time` (Open Graph).
- `modifiedTime?: string`  
  Emits `article:modified_time` (Open Graph).
- `alternates?: { hrefLang: string; href: string }[]`  
  Outputs hreflang alternates.

**Site-level overrides**
- `siteUrl?: string`
- `siteTitle?: string`
- `siteDesc?: string`
- `twitter?: string`
- `organization?: { name: string; url?: string; logo?: string; sameAs?: string[] }`
- `defaultImage?: string`

> Note: `Basic.astro` defines many *additional* props (breadcrumbs, keywords, issue/review/collection/person blocks, etc.) that are currently **not used** in the rendered output. They appear to be reserved for future expansion.

### Example
Place in your layout `<head>`:

```astro
---
// src/layouts/main.astro
import Basic from "@/components/seo/Basic.astro";

const { url } = Astro;
---
<head>
  <Basic
    title="Articles"
    description="Long-form editorial archive"
    pathname={url.pathname}
    image="/og/articles.png"
    robots="index,follow"
    alternates={[
      { hrefLang: "en", href: "/articles" },
      { hrefLang: "en-IN", href: "/in/articles" },
    ]}
  />
</head>
```

---

## `Breadcrumbs.astro`

### What it does

Emits a `BreadcrumbList` JSON-LD block for the current page.

Google supports breadcrumb structured data and provides implementation examples for `BreadcrumbList`. ([Google for Developers][1])

### Props (options)

* `trail: { name: string; item?: string }[]`
  Ordered crumbs. The last crumb may omit `item`; it will default to the current page URL.
* `id?: string`
  Override the JSON-LD node `@id` (defaults to `"<current-url>#breadcrumbs"`)

URLs are resolved to absolute using `Astro.site` (if present) or the current request origin.

### Example

```astro
---
import Breadcrumbs from "@/components/seo/Breadcrumbs.astro";
---
<Breadcrumbs
  trail={[
    { name: "Home", item: "/" },
    { name: "Articles", item: "/articles" },
    { name: "How the archive works" } // last item defaults to current URL
  ]}
/>
```

---

## `Organisation.astro`

### What it does

Outputs **two** JSON-LD nodes:

1. `Organization` — your canonical publisher identity.
2. `NewsMediaOrganization` — newsroom/publisher policies and transparency details.

This pairs well with a `WebSite` node that references the publisher. It also aligns with publisher best practices that encourage structured data and correct publish/modified dates on article pages. ([Google Help][2])

### Props (options)

**Required**

* `siteUrl: string` (default in file: `"https://auroville.today"`)
* `name: string` (default in file: `"Auroville Today"`)

**General organization**

* `url?: string` (abs/rel; defaults to `/`)
* `legalName?: string`
* `alternateName?: string | string[]`
* `description?: string`
* `logo?: string | { url: string; width?: number; height?: number }`
* `sameAs?: string[]`
* `inLanguage?: string` (default `"en"`; currently not emitted)
* `email?: string`
* `telephone?: string`
* `areaServed?: string | string[]`
* `foundingDate?: string` (ISO date)
* `founders?: { name: string; url?: string }[]`
* `parentOrganization?: { name: string; url?: string } | string`
* `address?: { streetAddress?; addressLocality?; addressRegion?; postalCode?; addressCountry? }`
* `contactPoints?: Array<{ contactType: string; email?; telephone?; areaServed?; availableLanguage?; url? }>`
* `taxID?: string`
* `duns?: string`
* `naics?: string`
* `awards?: string | string[]`

**NewsMediaOrganization policy / transparency links (optional)**

* `publishingPrinciples?: string` (URL)
* `correctionsPolicy?: string` (URL)
* `diversityPolicy?: string` (URL)
* `ethicsPolicy?: string` (URL)
* `verificationFactCheckingPolicy?: string` (URL)
* `masthead?: string` (URL)
* `missionCoveragePrioritiesPolicy?: string` (URL)
* `actionableFeedbackPolicy?: string` (URL)
* `coverageStartTime?: string` (ISO date; currently commented out in output)
* `ownershipFundingInfo?: string`

### Example (publisher identity, once per site)

Include once in your main layout:

```astro
---
import Organisation from "@/components/seo/Organisation.astro";
---
<Organisation
  siteUrl="https://example.com"
  name="Example Magazine"
  url="/"
  logo={{ url: "/logos/logo.png", width: 512, height: 512 }}
  sameAs={[
    "https://twitter.com/example",
    "https://www.youtube.com/@example"
  ]}
  publishingPrinciples="/policies/publishing-principles"
  correctionsPolicy="/policies/corrections"
  ethicsPolicy="/policies/ethics"
  masthead="/about/masthead"
  ownershipFundingInfo="Independent, reader-supported publication."
/>
```

---

## `Website.astro`

### What it does

Emits a minimal, “Google-friendly” `WebSite` JSON-LD node.

### Props (options)

**Required**

* `url: string` — canonical site root, e.g. `"https://example.com/"`
* `name: string` — site name

**Optional**

* `publisherId?: string` — stable `@id` for your Organization/NewsMediaOrganization node
* `id?: string` — override the `WebSite` node `@id` (defaults to `"<root>/#website"`)
* `inLanguage?: string` (default `"en"`)
* `alternateName?: string`
* `sameAs?: string[]`

### Example

```astro
---
import Website from "@/components/seo/Website.astro";
---
<Website
  url="https://example.com/"
  name="Example Magazine"
  publisherId="https://example.com/#org"
  sameAs={["https://twitter.com/example"]}
/>
```

> Implementation note: the file computes a safe-serialized `json` (with `<` escaped) but currently renders `JSON.stringify(data)` instead of that escaped string. If you want hardening, change the final line to `set:html={json}`.

---

## `Webpage.astro`

### What it does

Emits a **bundle** of JSON-LD nodes as a top-level array:

* `Organization` (publisher)
* `WebSite`
* `WebPage`
* optional `BreadcrumbList`

It’s designed for pages where you want to describe *the page itself* (not a specific article item).

### Props (options)

**Required (logged as warnings if missing)**

* `siteUrl: string`
* `siteName: string`
* `urlPath: string` (e.g. `"/articles/hello"`)
* `pageTitle: string`

**Optional**

* `description?: string`
* `inLanguage?: string` (default `"en"`)
* `pageType?: string` (default `"WebPage"`; can be `"CollectionPage"`, `"AboutPage"`, etc.)
* `image?: string` (primary image for the page → `primaryImageOfPage`)
* `author?: { name: string; url?: string }`
* `organization?: { name: string; url?: string; logo?: string; sameAs?: string[] }`
* `datePublished?: string`
* `dateModified?: string` (falls back to `datePublished`)
* `breadcrumbs?: Array<{ name: string; url: string }>` (inlined breadcrumb list)
* `searchTarget?: string` (present in props but currently not emitted)
* `speakableSelectors?: string[]` (optional `SpeakableSpecification`)

### Example (collection page)

```astro
---
import Webpage from "@/components/seo/Webpage.astro";
const { url } = Astro;
---
<Webpage
  siteUrl="https://example.com"
  siteName="Example Magazine"
  urlPath={url.pathname}
  pageTitle="Articles"
  pageType="CollectionPage"
  description="All articles in the archive."
  image="/og/articles.png"
  breadcrumbs={[
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" }
  ]}
/>
```

---

## `SiteNavigationElement.astro`

### What it does

Builds a hierarchical navigation tree using `SiteNavigationElement` and `hasPart` for nested items. This matches schema.org’s type/property definitions. ([Schema.org][3])

### Props (options)

* `items: Array<{ label: string; href?: string; children?: MenuItem[]; description?: string; id?: string }>`
  Nested menu structure. Headings can omit `href`.
* `name?: string` (default `"Primary navigation"`)
* `id?: string` (defaults to `"<origin>/#nav"`)
* `websiteId?: string`
  If provided, adds `isPartOf: { "@id": websiteId }` to connect nav → website.
* `inLanguage?: string` (default `"en"`)
* `baseUrl?: string`
  Forces a specific origin instead of relying on `Astro.site`/request.

IDs:

* If a menu item doesn’t provide an explicit `id`, the component generates one based on the label trail:
  `https://example.com/#nav-section-subsection-item`

### Example

```astro
---
import SiteNavigationElement from "@/components/seo/SiteNavigationElement.astro";

const menu = [
  { label: "Home", href: "/" },
  {
    label: "Articles",
    href: "/articles",
    children: [
      { label: "Topics", href: "/keywords" },
      { label: "Contributors", href: "/contributors" },
    ],
  },
  { label: "About", href: "/about", description: "About the project" },
];
---
<SiteNavigationElement
  items={menu}
  websiteId="https://example.com/#website"
  name="Primary navigation"
/>
```

---

## `Article.astro`

### What it does

Emits JSON-LD for a single editorial item and optional “registry”/“list” blocks:

* main `Article` node (comment header says “NewsArticle” but `@type` is currently `"Article"`).
* optional `DefinedTermSet` for keywords (registry of tags)
* optional `ItemList` of keyword pages
* optional `ItemList` of mentioned people
* optional `Person` nodes for each mentioned person

Google’s article structured data guidance recommends providing fields like `headline`, `image`, and publication dates when available. ([Google for Developers][4])

### Props (options)

**Required**

* `siteUrl?: string` (defaults from `@/data/website.json`)
* `urlPath: string` (path to this article page)
* `headline: string`

**Common optional**

* `siteName?: string` (defaults from website data; currently not emitted into the JSON)
* `description?: string`
* `inLanguage?: string` (default `"en"`)
* `image?: string` (primary image)
* `images?: string[]` (additional images)
* `thumbnailUrl?: string`
* `datePublished?: string`
* `dateModified?: string` (falls back to `datePublished`)
* `author?: { name: string; url?: string; type?: "Person" | "Organization" }`
* `publisher?: { name: string; url?: string; logo?: string; sameAs?: string[] }`
* `articleSection?: string`
* `articleBody?: string`
* `wordCount?: number`
* `identifier?: string | number | { "@type"?: "PropertyValue"; name?: string; value?: string }`
* `isAccessibleForFree?: boolean` (default `true`)
* `mainEntityOfPage?: string | { "@type"?: "WebPage"; "@id"?: string; url?: string }`

**Keywords input (flexible)**

* `keywords?: string | string[] | Array<{ title: string; slug?: string; numberOfArticles?: number }>`

  * If string: treated as CSV (`"foo, bar, baz"`)
  * If array of strings: titles
  * If objects: used to build:

    * `keywords` CSV string on the article
    * optional lists/registries with URLs and counts

**Mentions input**

* `mentionsPeople?: Array<string | { slug?: string; title?: string; name?: string }>`

  * Strings become names.
  * Objects can provide `slug` and a `title`/`name`.

**Extra blocks (switches)**

* `emitKeywordSet?: boolean` (default `false`)
* `emitKeywordList?: boolean` (default `true`)
* `emitMentionsList?: boolean` (default `true`)

### Minimal example

```astro
---
import ArticleLd from "@/components/seo/Article.astro";

const { url } = Astro;
const record = {
  title: "How the archive works",
  description: "A guided tour of the archive pipeline.",
  cover: "/attachments/att123/cover.jpg",
  published: "2026-01-01T10:00:00Z",
  modified: "2026-01-10T10:00:00Z",
};
---
<ArticleLd
  urlPath={url.pathname}
  headline={record.title}
  description={record.description}
  image={record.cover}
  datePublished={record.published}
  dateModified={record.modified}
/>
```

### Example with keyword objects + mentions

```astro
---
import ArticleLd from "@/components/seo/Article.astro";
const { url } = Astro;

const keywords = [
  { title: "Archives", slug: "/keywords/archives", numberOfArticles: 42 },
  { title: "Publishing", slug: "/keywords/publishing", numberOfArticles: 18 },
];

const mentionsPeople = [
  { title: "Barry Long", slug: "/contributors/barry-long" },
  "Mirra Alfassa",
];
---
<ArticleLd
  urlPath={url.pathname}
  headline="From Airtable to Astro"
  description="How the content pipeline works."
  keywords={keywords}
  mentionsPeople={mentionsPeople}
  emitKeywordSet={true}
  emitKeywordList={true}
  emitMentionsList={true}
/>
```

> Implementation notes:
>
> * The component normalizes keywords into a CSV for `keywords`, and can also emit keyword lists/registries.
> * The component also emits separate `Person` nodes for mentioned people (good for re-use via `@id` references).
> * There is a small mismatch in `mentionsRefs` construction (it references `n.slug` even though the person node uses `url`). If you see missing URLs in `mentions`, adjust that mapping to use the emitted `url` or carry the slug through.

---

## Suggested composition patterns

Use:

* `Basic.astro` on every page (meta tags)
* `Organisation.astro` + `Website.astro` + `SiteNavigationElement.astro` once per site (layout)
* `Breadcrumbs.astro` on pages where breadcrumbs are meaningful
* `Article.astro` only on article detail pages

---

## Validation workflow

* Run pages locally, view source, and copy the JSON-LD blocks into Google’s Rich Results Test. ([Google for Developers][5])
* For editorial pages, ensure key Article fields are present (headline, images, dates when available). ([Google for Developers][4])
* For breadcrumbs, follow Google’s breadcrumb structured data guidance. ([Google for Developers][1])

[1]: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb?utm_source=chatgpt.com "How To Add Breadcrumb (BreadcrumbList) Markup"
[2]: https://support.google.com/news/publisher-center/answer/9607104?hl=en&utm_source=chatgpt.com "Best practices for your article pages - Publisher Center Help"
[3]: https://schema.org/SiteNavigationElement?utm_source=chatgpt.com "SiteNavigationElement - Schema.org Type"
[4]: https://developers.google.com/search/docs/appearance/structured-data/article?utm_source=chatgpt.com "Learn About Article Schema Markup | Google Search Central"
[5]: https://developers.google.com/search/docs/appearance/structured-data?utm_source=chatgpt.com "Schema Markup Testing Tool | Google Search Central"
