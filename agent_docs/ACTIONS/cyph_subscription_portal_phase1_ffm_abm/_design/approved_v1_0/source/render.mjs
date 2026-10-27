// Render dist/**/*.html to PNG with Playwright at 2x. States come from each page's
// html[data-states]. Matrix (DESIGNER_HANDOFF §9):
//   • every page: default state in Slate at 1440 + 375, and in Mist at 1440 + 375
//   • every other state: Slate 1440; Mist 1440 when the state is a distinct form /
//     alert / quote / error treatment; Slate 375 for banner/alert states
//   • account-billing (canonical): every state in both themes at 375 and 1440, + menu open
// Usage: node render.mjs [file-substring]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("/opt/npm-tools/node_modules/playwright");
import { readdirSync, mkdirSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, "renders");
const filter = process.argv[2] || "";
if (!filter) rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "references"), { recursive: true });

const DISTINCT = /error|errors|invalid|unavailable|expired|failed|declined|duplicate|consent|past_due|denied|attention|unknown|reduce|existing|canceled|cancel_scheduled|email_failed|delayed|handoff_error|used|busy|leaving|loading|confirming|change_card/;
const VP = { desktop: { width: 1440, height: 900 }, mobile: { width: 375, height: 812 } };

function statesOf(html) {
  const m = html.match(/data-states="([^"]+)"/); const d = html.match(/data-default-state="([^"]+)"/);
  const list = m ? m[1].split(",").map((s) => s.split(":")[0]) : ["default"];
  return { list, def: d ? d[1] : list[0] };
}
function plan(file, html) {
  const { list, def } = statesOf(html);
  const shots = [];
  const add = (state, mode, vp, extra = "") => shots.push({ state, mode, vp, extra });
  if (file === "account-billing.html") {
    for (const s of list) for (const mode of ["dark", "light"]) for (const vp of ["desktop", "mobile"]) add(s, mode, vp);
    add(def, "dark", "mobile", "menu=1"); add(def, "light", "mobile", "menu=1");
    add(def, "light", "desktop", "tokens=fleet");
    return shots;
  }
  if (file === "style-tile.html") { add("tile", "light", "desktop"); add("tile", "dark", "desktop"); add("tile", "light", "mobile"); add("tile", "dark", "mobile"); add("tile", "light", "desktop", "tokens=fleet"); return shots; }
  for (const s of list) {
    if (s === def) { add(s, "dark", "desktop"); add(s, "dark", "mobile"); add(s, "light", "desktop"); add(s, "light", "mobile"); continue; }
    add(s, "dark", "desktop");
    if (DISTINCT.test(s)) { add(s, "light", "desktop"); add(s, "dark", "mobile"); }
  }
  return shots;
}

const pages = [
  ...readdirSync(DIST).filter((f) => f.endsWith(".html")).map((f) => ["", f]),
  ...(existsSync(join(DIST, "references")) ? readdirSync(join(DIST, "references")).filter((f) => f.endsWith(".html")).map((f) => ["references", f]) : []),
];
const browser = await chromium.launch();
let n = 0;
for (const [dir, file] of pages) {
  if (filter && !join(dir, file).includes(filter)) continue;
  const html = readFileSync(join(DIST, dir, file), "utf8");
  for (const sh of plan(file, html)) {
    const ctx = await browser.newContext({ viewport: VP[sh.vp], deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(`file://${join(DIST, dir, file)}?mode=${sh.mode}&state=${sh.state}&shot=1${sh.extra ? "&" + sh.extra : ""}`);
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(120);
    const modeName = sh.mode === "dark" ? "slate" : "mist";
    const extra = sh.extra ? "_" + sh.extra.replace("=1", "").replace("tokens=", "") + "" : "";
    const name = `${file.replace(".html", "")}__${sh.state.replace(/_/g, "-")}_${modeName}${extra}__${sh.vp}.png`;
    await page.screenshot({ path: join(OUT, dir, name), fullPage: true });
    n++; await ctx.close();
  }
  console.log("rendered", join(dir, file));
}
await browser.close();
console.log("total PNGs:", n);
