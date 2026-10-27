// Build: assemble src/*.html (and src/references/*.html) from partials, compile
// Tailwind against the portal token file, and inline CSS + Saira woff2 so each
// artifact opens offline as one file. Usage: node build.mjs
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist");
mkdirSync(join(OUT, "references"), { recursive: true });

const tokens = readFileSync(join(ROOT, "tokens/globals.scss"), "utf8");
const fleet = readFileSync(join(ROOT, "tokens/fleet-baseline.css"), "utf8");
const artifactCss = readFileSync(join(SRC, "_artifact.css"), "utf8");
const runtime = readFileSync(join(SRC, "partials/runtime.js"), "utf8");

const fontDir = join(ROOT, "node_modules/@fontsource/saira/files");
const faces = [400, 500, 600, 700].map((w) => {
  const b64 = readFileSync(join(fontDir, `saira-latin-${w}-normal.woff2`)).toString("base64");
  return `@font-face{font-family:"Saira";font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
}).join("\n");

function expand(html, depth = 0) {
  if (depth > 6) throw new Error("include depth");
  return html.replace(/<!--@include ([\w-]+)-->/g, (_, name) => expand(readFileSync(join(SRC, "partials", name + ".html"), "utf8"), depth + 1));
}

const pages = [
  ...readdirSync(SRC).filter((f) => f.endsWith(".html")).map((f) => ["", f]),
  ...(existsSync(join(SRC, "references")) ? readdirSync(join(SRC, "references")).filter((f) => f.endsWith(".html")).map((f) => ["references", f]) : []),
];
for (const [dir, file] of pages) {
  let html = expand(readFileSync(join(SRC, dir, file), "utf8"));
  html = html.replace("<!--__RUNTIME__-->", `<script>${runtime}</script>`);
  writeFileSync(join(ROOT, ".tw-input.css"), tokens + "\n" + fleet + "\n" + artifactCss);
  writeFileSync(join(ROOT, ".tw-content.html"), html);
  execSync(`npx tailwindcss -c tailwind.config.js -i .tw-input.css -o .tw-out.css --content .tw-content.html --minify`, { stdio: "pipe" });
  const css = readFileSync(join(ROOT, ".tw-out.css"), "utf8");
  const out = html.replace("<!--__CSS__-->", `<style>${faces}\n${css}</style>`);
  writeFileSync(join(OUT, dir, file), out);
  console.log("built", join(dir, file), Math.round(out.length / 1024) + "KB");
}
