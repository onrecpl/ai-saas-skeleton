import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import { compilePresentation, copySlideAssets } from "./compile-content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const contentRoot = path.join(root, "content");

async function main(): Promise<void> {
  await fs.mkdir(dist, { recursive: true });

  const { bundle, slideAssetCopies } = await compilePresentation(contentRoot);
  await copySlideAssets(dist, slideAssetCopies);

  await fs.writeFile(
    path.join(dist, "presentation.json"),
    JSON.stringify(bundle, null, 2),
    "utf8",
  );

  await esbuild.build({
    entryPoints: [path.join(root, "src", "main.ts")],
    bundle: true,
    outfile: path.join(dist, "app.js"),
    platform: "browser",
    format: "iife",
    target: ["es2022"],
    minify: true,
  });

  const indexHtml = await fs.readFile(path.join(root, "index.html"), "utf8");
  await fs.writeFile(path.join(dist, "index.html"), indexHtml, "utf8");

  const css = await fs.readFile(path.join(root, "src", "styles.css"), "utf8");
  await fs.writeFile(path.join(dist, "styles.css"), css, "utf8");

  console.log(
    "programistok: zapisano dist/ (presentation.json, app.js, index.html, styles.css, assets/…)",
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
