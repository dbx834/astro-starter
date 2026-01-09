import { getCollectionCached } from "./build-cache";

let once = null;

export function prewarmCollections() {
  if (once) return once;
  once = Promise.all([getCollectionCached("articles")]).then(() => {});
  return once;
}
