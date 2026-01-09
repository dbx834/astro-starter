import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folders = [
  "../../src/content/articles",
  // "../../src/resources/contributors",
];

async function cleanFolder(relFolder) {
  const folder = path.resolve(__dirname, relFolder);

  const entries = await readdir(folder, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((e) => e.isFile())
      .map(async (e) => {
        const target = path.join(folder, e.name);
        await unlink(target);
        console.log(`Removed: ${target}`);
      }),
  );
}

await Promise.all(folders.map(cleanFolder));
