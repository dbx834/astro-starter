# AIRTABLE + this framework

## Airtable sync + responsive media pipeline

This repository includes a small suite of Node/ESM scripts that let you use **Airtable as a lightweight CMS**, then **compile Airtable records into Astro-friendly content**, and finally **turn Airtable attachments into a fully responsive image set** (multiple formats + multiple sizes) that the browser can pick from automatically.

You can find this under `/scripts/airtable-sync`.

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

---

## Automatic cross-linking via Airtable “Reference” fields

This content pipeline supports **automatic cross-linking** between exported JSON records by following a simple naming convention in Airtable.

### Naming convention

Create Airtable fields whose names end with:

* `Reference` (singular link)
* `References` (plural link / multi-select link)

When records are exported, these fields should contain **record IDs** (e.g. `recAcGPVpS0JV8BSv`). The `n3-link.mjs` script then:

1. Finds any field ending in `Reference` / `References`
2. Loads the referenced JSON file from the corresponding table folder (by record ID filename)
3. Adds a sibling field that contains an **embedded copy** of the referenced record, with:

   * `__syncedAt` removed
   * any array fields removed (e.g. `cover`, `coverSource`, other `*References` fields)
4. Alphabetically sorts all keys before writing the file back in place

### How sibling fields are named

The embedded field name is derived from the reference field name:

* `articleReference` → embeds into `article`
* `sectionReferences` → embeds into `section`

So you always get: **`<stem>Reference(s)` → `<stem>`**.

### Examples

#### 1) One section belongs to one article

In the **Sections** table, add a linked record field (or formula outputting record IDs) called:

* `articleReference`

Exported JSON (before linking):

```json
{
  "recordId": "reckgFpdWxOw4LVeY",
  "articleReference": ["recAcGPVpS0JV8BSv"]
}
```

After running `link-references.mjs`, the script adds:

```json
{
  "article": {
    "index": "A1",
    "lastModified": "2026-01-24T11:03:05.000Z",
    "lastModifiedX": 1769252585,
    "recordId": "recAcGPVpS0JV8BSv",
    "slug": "/articles/1/some-title",
    "status": "Published",
    "text": "Some text\n",
    "title": "Some title"
  },
  "articleReference": ["recAcGPVpS0JV8BSv"],
  "recordId": "reckgFpdWxOw4LVeY"
}
```

Note: large array fields like `cover`, `coverSource`, `sectionReferences`, etc. are intentionally not embedded.

#### 2) One article has many sections

In the **Articles** table, add a linked record field called:

* `sectionReferences`

Exported JSON (before linking):

```json
{
  "recordId": "recAcGPVpS0JV8BSv",
  "sectionReferences": ["reckgFpdWxOw4LVeY", "recR9qLOMSI2n42yA"]
}
```

After running the script, you’ll also get a sibling `section` array containing embedded section objects (minified):

```json
{
  "recordId": "recAcGPVpS0JV8BSv",
  "sectionReferences": ["reckgFpdWxOw4LVeY", "recR9qLOMSI2n42yA"],
  "section": [
    { "index": "S1", "lastModified": "2026-01-24T11:02:46.000Z", "lastModifiedX": 1769252566, "recordId": "reckgFpdWxOw4LVeY" },
    { "index": "S2", "lastModified": "2026-01-24T11:02:12.000Z", "lastModifiedX": 1769252532, "recordId": "recR9qLOMSI2n42yA" }
  ]
}
```

### Practical tips

* Prefer Airtable **Linked record** fields for references (single or multiple), since they naturally represent relationships.
* Keep the field names stable once your pipeline depends on them (`articleReference`, `sectionReferences`, etc.).
* If you rename a reference field, you should also update any consumers expecting the embedded sibling field (`article`, `section`, etc.).
* Use the record ID as the exported value (the script resolves `/TableFolder/<recordId>.json`).
