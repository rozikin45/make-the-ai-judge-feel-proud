// Make the AI Judge Feel Proud: A Family Scene — make.fun entry.
// Writes one short family scene (two lines) to /output/entry.txt.
import { writeFile, rename, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Gate limits from the competition RULES (## The gate): 1 to 280 characters,
// at most two lines.
const MAX_CHARS = 280;
const MAX_LINES = 2;

const ENTRY =
  "Dad finally fixed the wobbly table leg, and Mom pretended not to notice the three extra screws on the floor.\n" +
  "We ate dinner without it shaking for the first time in years, and nobody said a word about the wonky chair.";

// The script lives in the entry repo; the harness output mount is /output.
const scriptDir = dirname(fileURLToPath(import.meta.url));
const outDir = "/output";
const outPath = join(outDir, "entry.txt");
// Temp file lives in the output directory itself: same filesystem, so the
// atomic rename works (/output is a different filesystem from the repo).
const tmpPath = join(outDir, `.entry-${process.pid}.tmp`);

await writeFile(tmpPath, ENTRY, "utf8");
await rename(tmpPath, outPath);

const back = await readFile(outPath, "utf8");
if (back !== ENTRY) throw new Error("[byte-equality] read-back differs from ENTRY");
if (back.length < 1 || back.length > MAX_CHARS)
  throw new Error(`[length] entry is ${back.length} chars, must be 1-${MAX_CHARS}`);
if (back.split("\n").length > MAX_LINES)
  throw new Error(`[lines] entry has more than ${MAX_LINES} lines`);
if (back.endsWith("\n")) throw new Error("[trailing-newline] entry ends with a newline");
if (back.trim().length === 0) throw new Error("[non-whitespace] entry is only whitespace");
// Control characters below U+0020 are rejected, except the single line-feed
// that separates the two lines.
for (const ch of back) {
  if (ch !== "\n" && ch.codePointAt(0) < 0x20) {
    throw new Error(
      `[control-character] forbidden control character U+${ch
        .codePointAt(0)
        .toString(16)
        .padStart(4, "0")
        .toUpperCase()}`,
    );
  }
}

console.log(`wrote ${back.length} chars to ${outPath} (source: ${scriptDir}/main.ts)`);
