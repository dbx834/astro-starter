import { getCollection } from "astro:content";

const cache = new Map();

function keyOf(name, args) {
  return JSON.stringify([name, ...args], (_k, v) =>
    typeof v === "function" ? v.toString() : v,
  );
}

/**
 * Cached wrapper over astro:content getCollection.
 * Usage:
 *   import { getCollectionCached as getCollection } from '@/lib/build-cache'
 *   const issues = await getCollection('issues')
 */
export function getCollectionCached(name, ...args) {
  const k = keyOf(name, args);
  if (!cache.has(k)) {
    cache.set(
      k,
      getCollection(name, ...args).then((rows) => {
        rows.forEach(Object.freeze);
        return Object.freeze(rows);
      }),
    );
  }
  return cache.get(k);
}

/** Optional: clear all cached collections (handy in dev HMR) */
export function clearCollectionCache() {
  cache.clear();
}
