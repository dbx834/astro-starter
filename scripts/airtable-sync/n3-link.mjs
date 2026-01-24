#!/usr/bin/env node
/**
 * Link JSON references across content folders using config.json.
 *
 * Always writes IN PLACE (overwrites the same files it reads),
 * and only writes when the file content changed.
 *
 * Usage:
 *   node link-references.mjs --config ./config.json
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2), {
  boolean: ["quiet"],
});

const quiet = Boolean(argv.quiet);
function log(...args) {
  if (!quiet) console.log(...args);
}

async function readJson(filePath) {
  const raw = await fsp.readFile(filePath, "utf8");
  return { raw, data: JSON.parse(raw) };
}

async function pathExists(p) {
  try {
    await fsp.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function writeFileAtomic(destPath, data) {
  const dir = path.dirname(destPath);
  await ensureDir(dir);
  const tmp = `${destPath}.tmp-${process.pid}-${Date.now()}`;
  await fsp.writeFile(tmp, data, "utf8");
  await fsp.rename(tmp, destPath);
}

function isJsonFile(p) {
  return p.toLowerCase().endsWith(".json");
}

// Flat folder scan only (no recursion)
async function listJsonFilesFlat(dir) {
  const out = [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (isJsonFile(ent.name)) out.push(path.join(dir, ent.name));
  }
  return out;
}

function deriveIdFromFilename(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function cloneDeep(x) {
  return globalThis.structuredClone
    ? structuredClone(x)
    : JSON.parse(JSON.stringify(x));
}

function stableJsonStringify(obj) {
  return JSON.stringify(obj, null, 2) + "\n";
}

function matchReferenceKey(key) {
  const mPlural = key.match(/^(.*)References$/);
  if (mPlural) return { stem: mPlural[1], plural: true };
  const mSingle = key.match(/^(.*)Reference$/);
  if (mSingle) return { stem: mSingle[1], plural: false };
  return null;
}

function toSiblingKey(stem) {
  if (!stem) return stem;
  return stem[0].toLowerCase() + stem.slice(1);
}

function kebabCase(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function pluralizeStem(stem) {
  const s = String(stem || "").toLowerCase();
  if (!s) return s;
  if (/[sxz]$/.test(s) || /(?:ch|sh)$/.test(s)) return `${s}es`;
  if (/[bcdfghjklmnpqrstvwxyz]y$/.test(s)) return `${s.slice(0, -1)}ies`;
  return `${s}s`;
}

/**
 * Resolve a folder path for a stem by looking at OUT_DIR_MAP keys.
 * Example: stem "article" -> "Articles" dir, stem "section" -> "Sections" dir
 */
function resolveFolderForStem(stem, outDirMap) {
  const s = String(stem || "").toLowerCase();
  if (!s) return null;

  const candidates = new Set([s, pluralizeStem(s)]);
  for (const [tableName, dir] of Object.entries(outDirMap)) {
    const t = String(tableName).toLowerCase();
    if (candidates.has(t)) return dir;
  }
  return null;
}

/**
 * Minify embedded record:
 * - drop __syncedAt
 * - drop any array-valued fields
 * - recurse into plain objects
 */
function minifyEmbeddedRecord(rec) {
  if (rec == null || typeof rec !== "object") return rec;
  if (Array.isArray(rec)) return undefined;

  const out = {};
  for (const [k, v] of Object.entries(rec)) {
    if (k === "__syncedAt") continue;
    if (Array.isArray(v)) continue;

    if (v && typeof v === "object") out[k] = minifyEmbeddedRecord(v);
    else out[k] = v;
  }
  return out;
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value && typeof value === "object") {
    const out = {};
    const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
    for (const k of keys) out[k] = sortKeysDeep(value[k]);
    return out;
  }
  return value;
}

async function loadConfig(configPath) {
  const abs = path.resolve(configPath);
  if (!(await pathExists(abs))) throw new Error(`Config not found: ${abs}`);
  const { data } = await readJson(abs);
  return { absPath: abs, dir: path.dirname(abs), config: data };
}

async function main() {
  const configPath = argv.config || "config.json";
  const {
    absPath: configAbs,
    dir: configDir,
    config,
  } = await loadConfig(configPath);

  const TABLES = config.TABLES;
  const OUT_DIR_MAP = config.OUT_DIR_MAP;

  if (!Array.isArray(TABLES) || !TABLES.length) {
    throw new Error(`config.TABLES must be a non-empty array`);
  }
  if (!OUT_DIR_MAP || typeof OUT_DIR_MAP !== "object") {
    throw new Error(`config.OUT_DIR_MAP must be an object`);
  }

  // Resolve source folders from TABLES + OUT_DIR_MAP
  const sourceDirs = TABLES.map((t) => {
    const p = OUT_DIR_MAP[t] ?? kebabCase(t);
    return path.resolve(configDir, p);
  });

  for (const d of sourceDirs) {
    if (!(await pathExists(d)))
      throw new Error(`Source folder not found: ${d}`);
  }

  // Collect files (flat only)
  const allFiles = [];
  for (const dir of sourceDirs) {
    allFiles.push(...(await listJsonFilesFlat(dir)));
  }

  // Index by recordId
  const byRecordId = new Map(); // id -> { data, filePath }
  const parseErrors = [];

  for (const fp of allFiles) {
    try {
      const { data } = await readJson(fp);
      const id = data?.recordId ?? deriveIdFromFilename(fp);
      byRecordId.set(String(id), { data, filePath: fp });
    } catch (e) {
      parseErrors.push({ filePath: fp, error: String(e?.message ?? e) });
    }
  }

  async function resolveRecord(id, stemHint) {
    if (!id) return null;

    const hit = byRecordId.get(String(id));
    if (hit) return cloneDeep(hit.data);

    // Lazy load by convention if possible
    const folderRaw = resolveFolderForStem(stemHint, OUT_DIR_MAP);
    if (!folderRaw) return null;

    const folderAbs = path.resolve(configDir, folderRaw);
    const candidate = path.join(folderAbs, `${id}.json`);
    if (!(await pathExists(candidate))) return null;

    try {
      const { data } = await readJson(candidate);
      return cloneDeep(data);
    } catch {
      return null;
    }
  }

  async function resolveInNode(node) {
    if (Array.isArray(node)) {
      for (const el of node) {
        if (el && typeof el === "object") await resolveInNode(el);
      }
      return;
    }
    if (!node || typeof node !== "object") return;

    const keys = Object.keys(node);

    for (const key of keys) {
      const info = matchReferenceKey(key);
      if (!info) continue;

      const siblingKey = toSiblingKey(info.stem);
      const val = node[key];

      if (info.plural) {
        const ids = Array.isArray(val) ? val : val == null ? [] : [val];
        const resolved = [];
        for (const rid of ids) {
          const rec = await resolveRecord(String(rid), info.stem);
          resolved.push(rec ? minifyEmbeddedRecord(rec) : null);
        }
        node[siblingKey] = resolved;
      } else {
        const rid = Array.isArray(val) ? val[0] : val;
        const rec = await resolveRecord(
          rid != null ? String(rid) : "",
          info.stem,
        );
        node[siblingKey] = rec ? minifyEmbeddedRecord(rec) : null;
      }
    }

    for (const key of keys) {
      const v = node[key];
      if (v && typeof v === "object") await resolveInNode(v);
    }
  }

  let changedCount = 0;
  let writtenCount = 0;

  for (const fp of allFiles) {
    let originalRaw, obj;
    try {
      const read = await readJson(fp);
      originalRaw = read.raw;
      obj = read.data;
    } catch {
      continue;
    }

    const outObj = cloneDeep(obj);
    await resolveInNode(outObj);
    const sortedObj = sortKeysDeep(outObj);
    const nextRaw = stableJsonStringify(sortedObj);

    const isChanged = originalRaw.trimEnd() !== nextRaw.trimEnd();
    if (!isChanged) continue;

    await writeFileAtomic(fp, nextRaw); // ALWAYS write back to the same file
    changedCount++;
    writtenCount++;
  }

  log(`Config:     ${configAbs}`);
  log(`Sources:    ${sourceDirs.join(", ")}`);
  log(`Files read: ${allFiles.length}`);
  if (parseErrors.length) {
    log(`Parse errs: ${parseErrors.length}`);
    for (const pe of parseErrors.slice(0, 10))
      log(`  - ${pe.filePath}: ${pe.error}`);
    if (parseErrors.length > 10) log(`  ... (${parseErrors.length - 10} more)`);
  }
  log(`Changed:    ${changedCount}`);
  log(`Written:    ${writtenCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
