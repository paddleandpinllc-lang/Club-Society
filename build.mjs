import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const outputDir = "dist";
const buildVersion = process.env.CF_PAGES_COMMIT_SHA?.slice(0, 12) || `build-${Date.now()}`;
const staticFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "sw.js",
  "_routes.json",
  "club-society-mark.svg",
  "favicon-32.png",
  "apple-touch-icon.png",
  "club-society-icon-192.png",
  "club-society-icon-512.png",
  "sample-rsvp-import.csv",
  "supabase-schema.sql",
  "PHASE-4-LAUNCH.md"
];
const versionedTextFiles = new Set(["index.html", "app.js", "sw.js"]);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const file of staticFiles) {
  if (versionedTextFiles.has(file)) {
    const contents = await readFile(file, "utf8");
    await writeFile(`${outputDir}/${file}`, contents.replaceAll("local-dev", buildVersion));
  } else {
    await copyFile(file, `${outputDir}/${file}`);
  }
}

console.log(`Club Society build version: ${buildVersion}`);
