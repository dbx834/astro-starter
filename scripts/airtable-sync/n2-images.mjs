/* eslint-disable no-console */

/**
 * Attachments pipeline w/ ML saliency
 *   node n2-images.mjs \
 *     --bases "Contributors,Keywords,Themes,Issues,Sections,Articles" \
 *     --baseDir . \
 *     --out ./static/attachments \
 *     --perHost 4 \
 *     --concurrency 4 \
 *     --limit 0 \
 *     --days 0 \
 *     --model ./models/u2netp.onnx \
 *     --rebuild
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import minimist from "minimist";
import sharp from "sharp";
import smartcrop from "smartcrop-sharp";
import sortBy from "lodash/sortBy.js";
import reverse from "lodash/reverse.js";
import { fileURLToPath } from "node:url";

/* ------------------------------ ESM __dirname ------------------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------------ CONFIG ------------------------------ */

const DEFAULTS = {
  bases: [
    "Articles",
    // "Contributors",
  ],
  baseDir: "../../src/content/",
  outRoot: "../../public/attachments/",
  perHost: 4,
  concurrency: Math.max(2, os.cpus().length - 1),
  limit: 0,
  days: 30,
  model: "./u2netp.onnx", // ONNX saliency model (U2Netp)
  rebuild: false,
};

const SIZES = [320, 480, 640, 768, 1024, 1280, 1536, 1920, 2560];
// const SIZES = [360, 640, 960, 1280, 1920, 2560];

const MIME_TO_EXT = {
  "image/avif": "avif",
  "image/webp": "webp",
  "image/jpeg": "jpeg",
  "image/png": "png",
};
const ACCEPTED_MIME = new Set([
  "image/avif",
  "image/webp",
  "image/jpeg",
  "image/png",
]);

/* ------------------------------ ARGS ------------------------------ */

const argv = minimist(process.argv.slice(2));
function argCSV(v, fallback) {
  if (!v) return fallback;
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const CONFIG = {
  bases: argCSV(argv.bases, DEFAULTS.bases),
  baseDir: argv.baseDir ?? DEFAULTS.baseDir,
  outRoot: argv.out ?? DEFAULTS.outRoot,
  perHost: Number.isFinite(+argv.perHost) ? +argv.perHost : DEFAULTS.perHost,
  concurrency: Number.isFinite(+argv.concurrency)
    ? +argv.concurrency
    : DEFAULTS.concurrency,
  limit: Number.isFinite(+argv.limit) ? +argv.limit : DEFAULTS.limit,
  days: Number.isFinite(+argv.days) ? +argv.days : DEFAULTS.days,
  model: argv.model ?? DEFAULTS.model,
  rebuild: Boolean(argv.rebuild ?? DEFAULTS.rebuild),
};

/* ------------------------------ FS utils ------------------------------ */

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function writeFileAtomic(file, data) {
  const dir = path.dirname(file);
  await ensureDir(dir);

  const tmp = path.join(
    dir,
    `.${path.basename(file)}.tmp-${process.pid}-${Date.now()}`,
  );

  await fsp.writeFile(tmp, data);

  // Windows-safe-ish: rename may fail if destination exists
  try {
    await fsp.rename(tmp, file);
  } catch {
    await fsp.writeFile(file, data);
    await fsp.rm(tmp, { force: true }).catch(() => {});
  }
}

async function writeJson(file, obj) {
  await writeFileAtomic(file, Buffer.from(JSON.stringify(obj, null, 2)));
}
async function readJson(file) {
  try {
    const buf = await fsp.readFile(file);
    return JSON.parse(String(buf));
  } catch {
    return null;
  }
}
async function fileExists(file) {
  try {
    await fsp.access(file, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------ Logging ------------------------------ */
const log = (...args) => console.log("[attachments]", ...args);

/* ------------------------------ Per-host limiter ------------------------------ */
class PerHostLimiter {
  constructor(maxPerHost = 4) {
    this.maxPerHost = maxPerHost;
    /** @type {Map<string, {active:number, queue: Array<() => void>}>} */
    this.hosts = new Map();
  }
  async schedule(url, fn) {
    const host = new URL(url).host;
    let bucket = this.hosts.get(host);
    if (!bucket) {
      bucket = { active: 0, queue: [] };
      this.hosts.set(host, bucket);
    }
    return new Promise((resolve, reject) => {
      const run = async () => {
        bucket.active++;
        try {
          const res = await fn();
          resolve(res);
        } catch (e) {
          reject(e);
        } finally {
          bucket.active--;
          if (bucket.queue.length) bucket.queue.shift()();
        }
      };
      if (bucket.active < this.maxPerHost) run();
      else bucket.queue.push(run);
    });
  }
}
const perHostLimiter = new PerHostLimiter(CONFIG.perHost);

/* ------------------------------ Helpers ------------------------------ */
function kebab(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

const FORMAT_TO_MIME = {
  avif: "image/avif",
  webp: "image/webp",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
};

function uniqSorted(nums) {
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

/**
 * Scan outDir and detect which derivative files actually exist.
 * Returns widths per format: { avif: [320, ...], webp: [...], jpeg: [...] }
 */
async function listDerivativeWidths(outDir) {
  let entries = [];
  try {
    entries = await fsp.readdir(outDir);
  } catch {
    return { avif: [], webp: [], jpeg: [] };
  }

  const acc = { avif: [], webp: [], jpeg: [] };

  for (const name of entries) {
    // match e.g. "768w.avif" "1024w.webp" "640w.jpeg"
    const m = String(name).match(/^(\d+)w\.(avif|webp|jpe?g)$/i);
    if (!m) continue;

    const w = Number(m[1]);
    if (!Number.isFinite(w) || w <= 0) continue;

    let ext = m[2].toLowerCase();
    if (ext === "jpg") ext = "jpeg";

    if (ext === "avif") acc.avif.push(w);
    if (ext === "webp") acc.webp.push(w);
    if (ext === "jpeg") acc.jpeg.push(w);
  }

  return {
    avif: uniqSorted(acc.avif),
    webp: uniqSorted(acc.webp),
    jpeg: uniqSorted(acc.jpeg),
  };
}

async function readDirJson(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await fsp.readdir(dir);
  } catch {
    return out;
  }
  for (const fn of entries) {
    if (!fn.endsWith(".json")) continue;
    const obj = await readJson(path.join(dir, fn));
    if (obj) out.push(obj);
  }
  return out;
}

async function buildAttachmentsIndex() {
  const index = [];
  for (const base of CONFIG.bases) {
    const dir = path.join(CONFIG.baseDir, kebab(base));
    const rows = await readDirJson(dir);
    for (const data of rows) {
      const sources = [
        { col: "cover", items: data.cover },
        { col: "attachments", items: data.attachments },
        { col: "sideAttachments", items: data.sideAttachments },
        { col: "footerAttachments", items: data.footerAttachments },
      ];
      for (const { col, items } of sources) {
        if (!Array.isArray(items) || items.length === 0) continue;
        for (let idx = 0; idx < items.length; idx++) {
          const a = items[idx];
          index.push({
            sourceTable: base,
            sourceRecord: data.recordId,
            sourceRecordTitle: data.title,
            sourceColumn: col,
            sourceKeywords: (data.keywordRefs || [])
              .map((k) => (k && k.title ? String(k.title).trim() : null))
              .filter(Boolean),
            sourceFullUrl: data.fullUrl || null,
            sourceIssuePublishedX: data.issuePublishedX || null,
            sourceSummary: data.summary || null,
            attachmentIndex: idx,
            lastModifiedX: data.lastModifiedX || 0,
            id: a.id,
            url: a.url,
            type: a.type,
            width: a.width,
            height: a.height,
            filename: a.filename,
          });
        }
      }
    }
  }
  return reverse(sortBy(index, "lastModifiedX"));
}

/* ------------------------------ Conditional fetch ------------------------------ */

async function fetchWithConditionals(url, targetDir, opts = {}) {
  const force = Boolean(opts.force);

  const httpStatePath = path.join(targetDir, "http.json");
  const httpState = force ? {} : (await readJson(httpStatePath)) || {};

  const headers = {};
  if (!force) {
    if (httpState.etag) headers["If-None-Match"] = httpState.etag;
    if (httpState.lastModified)
      headers["If-Modified-Since"] = httpState.lastModified;
  }

  const res = await perHostLimiter.schedule(url, () =>
    fetch(url, { headers }).catch(() => null),
  );
  if (!res) throw new Error(`Fetch failed: ${url}`);

  if (res.status === 304) {
    return { status: 304, updated: false, headers: httpState };
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  const etag = res.headers.get("etag") || null;
  const lastModified = res.headers.get("last-modified") || null;

  await writeJson(httpStatePath, { etag, lastModified });
  return { status: 200, updated: true, buf, etag, lastModified };
}

/* ------------------------------ Derivatives (Sharp) ------------------------------ */

function adaptiveQuality(size) {
  if (size <= 576) return 68;
  if (size <= 1200) return 76;
  return 82;
}

async function writeMaybe(file, buf, rebuild = false) {
  if (!rebuild) {
    const exists = await fileExists(file);
    if (exists) {
      const stat = await fsp.stat(file);
      if (stat.size > 0) return;
      await fsp.rm(file, { force: true });
    }
  }
  await writeFileAtomic(file, buf);
}

async function ensureDerivatives(originalPath, outDir, opts = {}) {
  const rebuild = Boolean(opts.rebuild);

  const img = sharp(originalPath, { failOn: "none" })
    .rotate()
    .withMetadata({ icc: "sRGB" });

  const meta = await img.metadata();
  const originalWidth = meta && meta.width ? Number(meta.width) : null;

  for (const width of SIZES) {
    // Do not upscale: skip widths above source width
    if (originalWidth && width > originalWidth) continue;

    const base = img.clone().resize({ width, withoutEnlargement: true });

    // avif
    {
      const out = path.join(outDir, `${width}w.avif`);
      if (rebuild || !(await fileExists(out))) {
        const buf = await base
          .clone()
          .avif({
            quality: adaptiveQuality(width),
            effort: 8,
            chromaSubsampling: "4:4:4",
          })
          .toBuffer();
        await writeMaybe(out, buf, rebuild);
      }
    }

    // webp
    {
      const out = path.join(outDir, `${width}w.webp`);
      if (rebuild || !(await fileExists(out))) {
        const buf = await base
          .clone()
          .webp({
            quality: adaptiveQuality(width),
            smartSubsample: true,
            alphaQuality: 100,
            lossless: false,
          })
          .toBuffer();
        await writeMaybe(out, buf, rebuild);
      }
    }

    // jpeg
    {
      const out = path.join(outDir, `${width}w.jpeg`);
      if (rebuild || !(await fileExists(out))) {
        const buf = await base
          .clone()
          .jpeg({
            quality: adaptiveQuality(width),
            mozjpeg: true,
            chromaSubsampling: "4:4:4",
          })
          .toBuffer();
        await writeMaybe(out, buf, rebuild);
      }
    }
  }

  return meta;
}

/* ------------------------------ LQIP & palette ------------------------------ */

async function makeLqipBase64(file) {
  const buf = await sharp(file)
    .rotate()
    .toColorspace("srgb")
    .resize(24)
    .blur(1)
    .jpeg({ quality: 50 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function dominantPalette(file) {
  const stats = await sharp(file).rotate().toColorspace("srgb").stats();
  const { r, g, b } = stats.dominant;
  return { r, g, b };
}

/* ------------------------------ ML Saliency (ONNX) ------------------------------ */

let ort = null;
let ortSession = null;
async function getOrtSession() {
  if (!ort) {
    const m = await import("onnxruntime-node");
    ort = m.default || m;
  }
  if (!ortSession) {
    ortSession = await ort.InferenceSession.create(CONFIG.model);
  }
  return ortSession;
}

async function saliencyFocusPoint(originalPath, meta) {
  try {
    const session = await getOrtSession();

    const inputName =
      (session.inputNames && session.inputNames[0]) ||
      (session.inputMetadata && Object.keys(session.inputMetadata)[0]) ||
      "input.1";

    if (!inputName) throw new Error("No input name found in ONNX session");

    const SIZE = 320;
    const { data } = await sharp(originalPath)
      .rotate()
      .toColorspace("srgb")
      .resize(SIZE, SIZE, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const chw = new Float32Array(1 * 3 * SIZE * SIZE);
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    for (let i = 0; i < SIZE * SIZE; i++) {
      const r = data[i * 3 + 0] / 255;
      const g = data[i * 3 + 1] / 255;
      const b = data[i * 3 + 2] / 255;
      chw[0 * SIZE * SIZE + i] = (r - mean[0]) / std[0];
      chw[1 * SIZE * SIZE + i] = (g - mean[1]) / std[1];
      chw[2 * SIZE * SIZE + i] = (b - mean[2]) / std[2];
    }

    const tensor = new ort.Tensor("float32", chw, [1, 3, SIZE, SIZE]);
    const outputs = await session.run({ [inputName]: tensor });

    const outName =
      (session.outputNames && session.outputNames[0]) ||
      Object.keys(outputs)[0];
    const out = outputs[outName];
    if (!out || !out.data) throw new Error("No output tensor from ONNX");

    const dims = out.dims || [];
    let H, W;
    if (dims.length >= 2) {
      W = dims[dims.length - 1];
      H = dims[dims.length - 2];
    } else {
      const side = Math.round(Math.sqrt(out.data.length));
      if (side * side !== out.data.length) {
        throw new Error(`Unexpected saliency length ${out.data.length}`);
      }
      H = W = side;
    }

    const sal = out.data;
    const planeLen = H * W;
    const offset = sal.length - planeLen;

    let maxIdx = 0;
    let maxVal = -Infinity;
    for (let i = 0; i < planeLen; i++) {
      const v = sal[offset + i];
      if (v > maxVal) {
        maxVal = v;
        maxIdx = i;
      }
    }

    const yHat = Math.floor(maxIdx / W);
    const xHat = maxIdx % W;

    const x = Math.round((xHat / (W - 1)) * (meta.width - 1));
    const y = Math.round((yHat / (H - 1)) * (meta.height - 1));

    return {
      x,
      y,
      xPercent: Number(((x / meta.width) * 100).toFixed(2)),
      yPercent: Number(((y / meta.height) * 100).toFixed(2)),
      method: "ml-saliency",
    };
  } catch (err) {
    console.warn("[saliency] falling back to SmartCrop:", err.message);
    try {
      const { topCrop } = await smartcrop.crop(originalPath, {
        width: 200,
        height: 200,
      });
      if (topCrop) {
        const cx = topCrop.x + topCrop.width / 2;
        const cy = topCrop.y + topCrop.height / 2;
        return {
          x: Math.round(cx),
          y: Math.round(cy),
          xPercent: Number(((cx / meta.width) * 100).toFixed(2)),
          yPercent: Number(((cy / meta.height) * 100).toFixed(2)),
          method: "smartcrop-fallback",
        };
      }
    } catch {}
    return null;
  }
}

/* ------------------------------ Manifest ------------------------------ */
async function writeManifest(id, originalPath, meta, outDir) {
  const s = sharp(originalPath);
  const { width, height, format } = await s.metadata();

  const wNum = Number(width) || null;
  const hNum = Number(height) || null;
  const aspectRatio = wNum && hNum ? Number((wNum / hNum).toFixed(6)) : null;

  const placeholder = await makeLqipBase64(originalPath);
  const palette = await dominantPalette(originalPath);
  const focus = await saliencyFocusPoint(originalPath, {
    width: wNum || 1,
    height: hNum || 1,
  });

  const base = `/attachments/${id}`;

  // Use the actual original file extension (index.jpeg / index.png / etc.)
  const originalExt =
    path.extname(originalPath).slice(1).toLowerCase() || "jpeg";

  // Pick a sensible mime:
  // - prefer Airtable attachment mime if present
  // - else infer from sharp format
  // - else fall back to originalExt mapping
  const inferredMime =
    meta?.type ||
    (format ? FORMAT_TO_MIME[String(format).toLowerCase()] : null) ||
    FORMAT_TO_MIME[originalExt] ||
    null;

  // Clean sources: only what actually exists on disk
  const widths = await listDerivativeWidths(outDir);

  const manifest = {
    id,
    width: wNum,
    height: hNum,
    aspectRatio,
    mime: inferredMime,

    // Only existing derivative URLs (no dead links)
    sources: {
      avif: widths.avif.map((w) => `${base}/${w}w.avif`),
      webp: widths.webp.map((w) => `${base}/${w}w.webp`),
      jpeg: widths.jpeg.map((w) => `${base}/${w}w.jpeg`),
    },

    // Original (the downloaded index.<ext>)
    original: `${base}/index.${originalExt}`,

    placeholder,
    palette,
    focus,

    meta: {
      sourceTable: meta.sourceTable,
      sourceRecord: meta.sourceRecord,
      sourceRecordTitle: meta.sourceRecordTitle,
      sourceColumn: meta.sourceColumn,
      sourceKeywords: meta.sourceKeywords,
      sourceFullUrl: meta.sourceFullUrl,
      sourceIssuePublishedX: meta.sourceIssuePublishedX,
      sourceSummary: meta.sourceSummary,
      lastModifiedX: meta.lastModifiedX,
    },
  };

  await writeJson(path.join(outDir, "manifest.json"), manifest);
}

/* ------------------------------ Main per-attachment ------------------------------ */

async function processAttachment(att) {
  const { id, url, type, lastModifiedX } = att;
  if (!id || !url || !ACCEPTED_MIME.has(type)) return { skipped: true };

  // Days cutoff filter
  if (CONFIG.days > 0) {
    const cutoff = Math.floor((Date.now() - CONFIG.days * 86400000) / 1000);
    if ((lastModifiedX || 0) < cutoff) return { skipped: true };
  }

  const outDir = path.join(CONFIG.outRoot, id);
  const originalExt = MIME_TO_EXT[type] || "jpeg";
  const originalPath = path.join(outDir, `index.${originalExt}`);
  const httpPath = path.join(outDir, "http.json");

  const originalExists = await fileExists(originalPath);
  const httpExists = await fileExists(httpPath);

  if (!originalExists || !httpExists) await ensureDir(outDir);

  // Fetch (conditional where safe)
  let fetched = false;

  try {
    // If original is missing, force a non-conditional fetch (avoid 304 without a local file).
    let res = await fetchWithConditionals(url, outDir, {
      force: !originalExists,
    });

    // Safety: if we somehow got 304 but the original is missing, retry unconditionally.
    if (res.status === 304 && !(await fileExists(originalPath))) {
      res = await fetchWithConditionals(url, outDir, { force: true });
    }

    if (res.status === 200 && res.updated) {
      await writeFileAtomic(originalPath, res.buf);
      fetched = true;
      log("fetched", id);
    } else if (res.status === 304) {
      log("not-modified", id);
    }
  } catch (e) {
    log("fetch-failed", id, e.message);
    return { ok: false };
  }

  // Derivatives (honour --rebuild; do not upscale beyond source)
  await ensureDerivatives(originalPath, outDir, { rebuild: CONFIG.rebuild });

  // Manifest (includes placeholder, palette, focus)
  await writeManifest(id, originalPath, att, outDir);

  return { ok: true, fetched };
}

/* ------------------------------ MAIN ------------------------------ */

async function main() {
  log("starting with config:", CONFIG);
  await ensureDir(CONFIG.outRoot);

  const attachments = await buildAttachmentsIndex();

  // Await this (don’t drop the promise)
  await writeJson(path.join("./indexes", "attachments.json"), attachments);
  log("attachments discovered:", attachments.length);

  const items =
    CONFIG.limit > 0 ? attachments.slice(0, CONFIG.limit) : attachments;

  let done = 0;
  let fetched = 0;

  // throttle global inflight (IO + CPU) without workers
  const gate = [];
  const MAX_INFLIGHT = CONFIG.concurrency;

  for (const att of items) {
    if (gate.length >= MAX_INFLIGHT) await Promise.race(gate);

    const p = processAttachment(att)
      .then((res) => {
        if (res && res.fetched) fetched++;
      })
      .catch((err) => {
        console.error("error", att.id, err?.message);
      })
      .finally(() => {
        done++;

        // safer removal
        const i = gate.indexOf(p);
        if (i >= 0) gate.splice(i, 1);

        if (done % 20 === 0 || done === items.length) {
          log(`progress ${done}/${items.length} (fetched:${fetched})`);
        }
      });

    gate.push(p);
  }

  await Promise.all(gate);

  log("all done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
