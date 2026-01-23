import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import website from "@/data/website.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isString = (v) => typeof v === "string" && v.trim().length > 0;

export const trimSlash = (s = "") => s.replace(/\/+$/, "");

export const ensureAbs = (u, baseString = website.siteUrl) => {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return trimSlash(baseString || "") + (u.startsWith("/") ? u : "/" + u);
};

export const defined = (v) => v !== undefined && v !== null && v !== "";

export const prune = (obj) => {
  if (Array.isArray(obj)) {
    const a = obj.map(prune).filter(defined);
    return a.length ? a : undefined;
  }
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const pv = prune(v);
      if (defined(pv)) out[k] = pv;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return defined(obj) ? obj : undefined;
};

export const toArray = (x) => (Array.isArray(x) ? x : defined(x) ? [x] : []);
export const dedupe = (arr) => Array.from(new Set(arr));
export const slugify = (s = "") =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

/** pad("4") => "04" */
export const pad = (n: number) => String(n).padStart(2, "0");

/** format seconds as mm:ss or h:mm:ss */
export const formatTime = (seconds: number) => {
  const s = Math.max(0, seconds);
  const date = new Date(s * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = pad(date.getUTCSeconds());
  if (hh) return `${hh}:${pad(mm)}:${ss}`;
  return `${mm}:${ss}`;
};
