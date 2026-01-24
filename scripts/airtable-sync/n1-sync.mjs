/* eslint-disable no-console */
import dotenv from "dotenv";
import { readFile, writeFile, rename, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Airtable from "airtable";

dotenv.config({ path: "../../.env" });

/* ============================
   ESM dirname/filename
   ============================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================
   Configuration (via env)
   ============================ */
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const CUTOFF_BACKOFF_MIN = Number(process.env.AIRTABLE_CUTOFF_BACKOFF_MIN ?? 5);

const PUBLISHED_VIEW = "PUBLISHED";
const LAST_MOD_FIELD = "Last modified";
const FULL_SYNC = process.argv.includes("--full");

// Tables to fetch from main base
const TABLES = [
  "Articles",
  "Sections",
  // "Contributors",
];

// Output directories per table (fallback to kebabCase(table))
const OUT_DIR_MAP = {
  Articles: "../../src/content/articles",
  Sections: "../../src/content/sections",
  // Contributors: "../../src/resources/contributors",
};

/* ============================
   Guards
   ============================ */
for (const [name, value] of [
  ["AIRTABLE_API_KEY", AIRTABLE_API_KEY],
  ["AIRTABLE_BASE_ID", AIRTABLE_BASE_ID],
]) {
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

/* ============================
   Helpers
   ============================ */
const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY });

const SYNC_STATE_PATH = path.resolve(__dirname, ".cache", "airtable-sync.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const resolveMaybeRelativeToScript = (p) =>
  path.isAbsolute(p) ? p : path.resolve(__dirname, p);

const kebabCase = (input) =>
  String(input)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const camelCase = (input) => {
  const parts = String(input)
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);

  if (!parts.length) return "";
  const [first, ...rest] = parts;

  return (
    first.toLowerCase() +
    rest
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join("")
  );
};

async function readSyncState() {
  try {
    const raw = await readFile(SYNC_STATE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeSyncState(state) {
  const dir = path.dirname(SYNC_STATE_PATH);
  await mkdir(dir, { recursive: true });

  const tmp = `${SYNC_STATE_PATH}.tmp`;
  const data = JSON.stringify(state, null, 2);

  await writeFile(tmp, data, "utf8");

  try {
    // Atomic-ish replace on POSIX; may fail on Windows if destination exists.
    await rename(tmp, SYNC_STATE_PATH);
  } catch {
    // Fallback overwrite
    await writeFile(SYNC_STATE_PATH, data, "utf8");
    await unlink(tmp).catch(() => {});
  }
}

/**
 * Builds an Airtable formula that selects records modified strictly after a cutoff,
 * with a safety backoff window. Uses DATETIME_PARSE for robust string parsing.
 */
function buildSinceFormula(fieldName, lastSyncISO, backoffMinutes = 0) {
  if (!lastSyncISO) return undefined;

  const escaped = String(lastSyncISO).replace(/"/g, '\\"');
  const baseExpr = `DATETIME_PARSE("${escaped}")`;

  const cutoffExpr =
    backoffMinutes && Number.isFinite(backoffMinutes) && backoffMinutes > 0
      ? `DATEADD(${baseExpr}, -${backoffMinutes}, 'minutes')`
      : baseExpr;

  return `IS_AFTER({${fieldName}}, ${cutoffExpr})`;
}

/**
 * Key for per-table checkpoint.
 */
function checkpointKey(baseId, table) {
  return `${baseId}:${table}`;
}

/**
 * Process a single Airtable record and write a normalized JSON file
 * only if the data changed relative to the existing local file.
 */
async function processAirtableRecord(record, folder, options = {}) {
  const rejected = options.rejected ?? [];
  const attachmentFields = options.attachmentFields ?? [
    "Cover",
    "Attachments",
    "allAttachments",
    "coverAttachment",
  ];

  const fields = record.fields ?? {};

  // Build output WITHOUT __syncedAt first (we only set it when we actually write)
  const out = {
    recordId: record.id,
  };

  // Rules: fields that should be number-ified (exact Airtable column names)
  const NUMERIC_X_RULE =
    /^(Published X|Last modified X|Issue published X|Created X)$/i;

  const attachmentSet = new Set(attachmentFields);

  const normalizeKey = (key) => {
    if (!key) return null;

    const s = String(key);

    // Skip Airtable fields starting with "_" (e.g. "_Internal", "__foo")
    if (s.startsWith("_")) return null;

    // Skip question-type fields
    if (s.endsWith("?")) return null;

    // Keep your URL -> Url normalization
    const fixed = s.replace(/URL/g, "Url");

    return camelCase(fixed);
  };

  const normalizeAttachments = (val) => {
    if (!Array.isArray(val)) return [];
    return val.map((a) => {
      const { thumbnails, width, height, filename, ...rest } = a || {};
      const parsed = path.parse(String(filename || ""));
      const safeH = Number(height) || 1;
      const safeW = Number(width) || 0;
      const aspectRatio = safeW && safeH ? safeW / safeH : null;

      return {
        ...rest,
        width,
        height,
        filename,
        cleanFilename: String(parsed.name || "").trim(),
        aspectRatio,
      };
    });
  };

  // Normalize record fields into `out`
  for (const [rawKey, rawVal] of Object.entries(fields)) {
    if (rejected.includes(rawKey)) continue;
    if (typeof rawVal === "function") continue;

    const nk = normalizeKey(rawKey);
    if (!nk) continue;

    if (NUMERIC_X_RULE.test(rawKey)) {
      const num = Number.parseInt(String(rawVal), 10);
      out[nk] = Number.isFinite(num) ? num : rawVal;
      continue;
    }

    if (attachmentSet.has(rawKey)) {
      const attachments = normalizeAttachments(rawVal);
      out[nk] = attachments;
      // out[`${nk}Source`] = attachments; // parity with your current shape
      continue;
    }

    out[nk] = rawVal;
  }

  // ----- comparison helpers (stable, ignores key insertion order) -----
  const deepSort = (value) => {
    if (Array.isArray(value)) return value.map(deepSort);
    if (value && typeof value === "object" && value.constructor === Object) {
      return Object.fromEntries(
        Object.keys(value)
          .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
          .map((k) => [k, deepSort(value[k])]),
      );
    }
    return value;
  };

  // Comparable snapshots (ignore __syncedAt)
  const comparableNewObj = deepSort(out);
  const comparableNewStr = JSON.stringify(comparableNewObj);

  const outDir = resolveMaybeRelativeToScript(folder);
  const outfile = path.join(outDir, `${record.id}.json`);
  const tmpfile = `${outfile}.tmp`;

  await mkdir(outDir, { recursive: true });

  // Load previous file (if present) and compare ignoring __syncedAt
  let comparablePrevStr = null;
  try {
    const prevText = await readFile(outfile, "utf8");
    const prevObj = JSON.parse(prevText);

    if (prevObj && typeof prevObj === "object") {
      delete prevObj.__syncedAt;
      comparablePrevStr = JSON.stringify(deepSort(prevObj));
    }
  } catch {
    // file missing or invalid JSON -> treat as changed
  }

  // If data is identical, do not touch the file (and do not bump __syncedAt)
  if (comparablePrevStr === comparableNewStr) {
    console.log(`⏭︎  Unchanged: ${path.relative(process.cwd(), outfile)}`);
    return { outfile, wrote: false, bytes: 0 };
  }

  // Data changed (or file missing) -> write full output, now including __syncedAt
  const finalOut = { ...out, __syncedAt: new Date().toISOString() };

  // Stable top-level key order for readable diffs
  const ordered = Object.fromEntries(
    Object.keys(finalOut)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      .map((k) => [k, finalOut[k]]),
  );

  const outJson = `${JSON.stringify(ordered, null, 2)}\n`;

  await writeFile(tmpfile, outJson, "utf8");
  try {
    await rename(tmpfile, outfile);
  } catch {
    // Fallback overwrite (Windows edge cases)
    await writeFile(outfile, outJson, "utf8");
    await unlink(tmpfile).catch(() => {});
  }

  console.log(
    `💾 Wrote: ${path.relative(process.cwd(), outfile)} (${outJson.length} bytes)`,
  );
  return { outfile, wrote: true, bytes: outJson.length };
}

/**
 * Table fetcher with paging and incremental filter.
 */
async function fetchTable({
  baseId,
  table,
  view = PUBLISHED_VIEW,
  outDir,
  fields,
  filterByFormula,
}) {
  const base = airtable.base(baseId);
  const start = Date.now();
  let total = 0;
  let pages = 0;
  let failures = 0;

  const selectOpts = { view, pageSize: 100 };
  if (Array.isArray(fields) && fields.length) selectOpts.fields = fields;
  if (filterByFormula) selectOpts.filterByFormula = filterByFormula;

  console.log(
    `→ Fetching ${table} (base ${baseId}, view: ${view})${
      filterByFormula ? " [incremental]" : ""
    }`,
  );

  await new Promise((resolve, reject) => {
    base(table)
      .select(selectOpts)
      .eachPage(
        (records, fetchNextPage) => {
          (async () => {
            pages += 1;

            // Process sequentially to keep memory/disk churn lower.
            for (const record of records) {
              try {
                await processAirtableRecord(record, outDir);
                total += 1;
              } catch (err) {
                failures += 1;
                console.error(
                  `processAirtableRecord failed for ${table}#${record.id}: ${
                    err?.message || err
                  }`,
                );
              }
            }

            // Gentle throttle between pages
            await sleep(120);
            fetchNextPage();
          })().catch(reject);
        },
        (err) => (err ? reject(err) : resolve()),
      );
  });

  if (failures > 0) {
    throw new Error(`${table}: ${failures} record(s) failed during processing`);
  }

  const ms = Date.now() - start;
  console.log(
    `✓ Completed ${table} (base ${baseId}): ${total} record(s) in ${ms}ms across ${pages} page(s).`,
  );
}

/* ============================
   Orchestration
   ============================ */
async function run() {
  const syncStartISO = new Date().toISOString();
  const state = await readSyncState();

  try {
    for (const table of TABLES) {
      const outDir = OUT_DIR_MAP[table] || kebabCase(table);

      const key = checkpointKey(AIRTABLE_BASE_ID, table);
      const lastSyncISO = FULL_SYNC ? null : state[key];

      const filterByFormula = lastSyncISO
        ? buildSinceFormula(LAST_MOD_FIELD, lastSyncISO, CUTOFF_BACKOFF_MIN)
        : undefined;

      await fetchTable({
        baseId: AIRTABLE_BASE_ID,
        table,
        view: PUBLISHED_VIEW,
        outDir,
        filterByFormula,
      });

      // Advance checkpoint to run start (prevents missing mid-run edits)
      state[key] = syncStartISO;
      await writeSyncState(state);
    }

    console.log(
      `All done. ${FULL_SYNC ? "(full sync)" : "(incremental sync)"}`,
    );
  } catch (err) {
    console.error("Fetch failed:", err);
    process.exitCode = 1;
  }
}

run();
