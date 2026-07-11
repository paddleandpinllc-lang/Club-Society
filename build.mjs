import { copyFile, mkdir, rm } from "node:fs/promises";

const outputDir = "dist";
const staticFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "sw.js",
  "club-society-mark.svg",
  "favicon-32.png",
  "apple-touch-icon.png",
  "club-society-icon-192.png",
  "club-society-icon-512.png",
  "sample-rsvp-import.csv",
  "supabase-schema.sql",
  "PHASE-4-LAUNCH.md"
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const file of staticFiles) {
  await copyFile(file, `${outputDir}/${file}`);
}
