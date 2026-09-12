import { chromium } from "@playwright/test";
import { writeFile, readFile } from "node:fs/promises";

const ALLOW = ["caas.ncssm.edu","registrar.ncssm.edu","accessibility.ncssm.edu",
 "counseling.ncssm.edu","dur-counseling.ncssm.edu","ecs.ncssm.edu","humanities.ncssm.edu",
 "datascience.ncssm.edu","research-innovation.ncssm.edu","fablab.ncssm.edu","pthfablab.ncssm.edu",
 "wlplacement.ncssm.edu","courses.ncssm.edu","broadstreetscientific.ncssm.edu",
 "worldlanguages.ncssm.edu","sites.google.com","www.ncssm.edu","ie.ncssm.edu"];

const SKIP = /morganton|\/online\b|mor-|\/summer|admissions|\/give|donate|alumni|\/news|\/in-the-media|human-resources|employee|\/directory\/|facebook|twitter|instagram|linkedin|youtube|\/event\/|tedx|gounis|photo-gallery|\.jpg|\.png/i;

const out = process.argv[2];
/* Resume from the previous sweep's frontier rather than starting over. */
const prior = (await readFile(out + "/sweep-links.txt", "utf8")).split("\n")
  .map((l) => l.split("\t")[0]).filter(Boolean);
const visitedBefore = new Set((await readFile(out + "/sweep-pages.txt", "utf8")).split("\n")
  .map((l) => l.split("\t")[0]).filter(Boolean));

const queue = prior.filter((u) => {
  try { return ALLOW.includes(new URL(u).hostname) && !visitedBefore.has(u) && !SKIP.test(u); }
  catch { return false; }
});
const seen = new Set([...queue, ...visitedBefore]);

const b = await chromium.launch();
const ctx = await b.newContext({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" });
const p = await ctx.newPage();
const pages = new Map(), external = new Map(), lastHit = new Map();

const unwrap = (h) => { try { const u = new URL(h);
  if (u.hostname.endsWith("google.com") && u.pathname === "/url") return u.searchParams.get("q") || h;
} catch {} return h; };

async function polite(host) {
  const prev = lastHit.get(host) ?? 0, wait = 700 - (Date.now() - prev);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastHit.set(host, Date.now());
}

console.log("resuming with", queue.length, "queued");
while (queue.length && pages.size < 1400) {
  const url = queue.shift();
  let host; try { host = new URL(url).host; } catch { continue; }
  await polite(host);
  try {
    await p.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await p.waitForTimeout(350);
    pages.set(url, (await p.title()).replace(/\s+/g, " ").trim());
    const links = await p.$$eval("a[href]", (as) => as.map((a) => ({
      href: a.href, text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 110) })));
    for (const raw of links) {
      const href = unwrap(raw.href);
      let u; try { u = new URL(href); } catch { continue; }
      if (!/^https?:$/.test(u.protocol)) continue;
      const clean = (u.origin + u.pathname + u.search).replace(/\/$/, "");
      if (SKIP.test(clean)) continue;
      if (raw.text.length > 2 && !external.has(clean)) external.set(clean, raw.text);
      if (ALLOW.includes(u.hostname) && !seen.has(clean)) { seen.add(clean); queue.push(clean); }
    }
  } catch (e) { /* keep going */ }
  if (pages.size % 100 === 0) console.log("...", pages.size, "pages,", queue.length, "queued");
}
await writeFile(out + "/sweep2-links.txt", [...external.entries()].sort().map(([u,t]) => `${u}\t${t}`).join("\n"));
console.log("DONE2 pages:", pages.size, "| destinations:", external.size, "| queue left:", queue.length);
await b.close();
