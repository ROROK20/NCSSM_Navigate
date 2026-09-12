import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";

/* Every NCSSM-owned host we know about. Anything outside this list is recorded
   as a destination but never crawled into. */
const ALLOW = [
  "caas.ncssm.edu", "registrar.ncssm.edu", "accessibility.ncssm.edu",
  "counseling.ncssm.edu", "dur-counseling.ncssm.edu", "ecs.ncssm.edu",
  "humanities.ncssm.edu", "datascience.ncssm.edu", "research-innovation.ncssm.edu",
  "fablab.ncssm.edu", "pthfablab.ncssm.edu", "wlplacement.ncssm.edu",
  "courses.ncssm.edu", "broadstreetscientific.ncssm.edu", "worldlanguages.ncssm.edu",
  "www.gounis.com", "sites.google.com", "www.ncssm.edu",
];

const SEEDS = [
  "https://registrar.ncssm.edu/", "https://accessibility.ncssm.edu/home",
  "https://counseling.ncssm.edu/home", "https://dur-counseling.ncssm.edu/",
  "https://ecs.ncssm.edu/", "https://humanities.ncssm.edu/home",
  "https://datascience.ncssm.edu/", "https://research-innovation.ncssm.edu/home",
  "https://fablab.ncssm.edu/", "https://wlplacement.ncssm.edu/",
  "https://broadstreetscientific.ncssm.edu/", "https://www.gounis.com/",
  "https://sites.google.com/ncssm.edu/science/home",
  "https://sites.google.com/ncssm.edu/worldlanguages/home",
  "https://sites.google.com/ncssm.edu/durham-cs/home",
  "https://sites.google.com/ncssm.edu/saa-durham/home",
  "https://sites.google.com/ncssm.edu/ncssmhousing/",
  "https://sites.google.com/ncssm.edu/apexams/home",
  "https://sites.google.com/ncssm.edu/ncssmresiliencyresources/home",
  "https://sites.google.com/ncssm.edu/healthandwellness/student-health/durham-student-health-clinic",
  "https://sites.google.com/ncssm.edu/ncssmfinearts",
  "https://www.ncssm.edu/residential", "https://www.ncssm.edu/residential/campus-life",
  "https://www.ncssm.edu/residential/activities-clubs",
  "https://www.ncssm.edu/residential/safety-support",
  "https://www.ncssm.edu/contact/durham-emergency-info",
];

/* Morganton, Online, admissions, news and staff-HR material are out of scope
   for a Durham student directory and would bury the useful rows. */
const SKIP =
  /morganton|\/online\b|mor-|\/summer|admissions|\/give|donate|alumni|\/news|\/in-the-media|human-resources|employee|\/directory\/|facebook|twitter|instagram|linkedin|youtube|\/event\/|tedx/i;

const b = await chromium.launch();
const ctx = await b.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
});
const p = await ctx.newPage();

const pages = new Map();
const external = new Map();
const seen = new Set(SEEDS);
const queue = [...SEEDS];
const lastHit = new Map();

function unwrap(href) {
  try {
    const u = new URL(href);
    if (u.hostname.endsWith("google.com") && u.pathname === "/url") {
      const q = u.searchParams.get("q");
      if (q) return q;
    }
  } catch {}
  return href;
}

async function polite(host) {
  const prev = lastHit.get(host) ?? 0;
  const wait = 800 - (Date.now() - prev);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastHit.set(host, Date.now());
}

while (queue.length && pages.size < 500) {
  const url = queue.shift();
  let host;
  try { host = new URL(url).host; } catch { continue; }
  await polite(host);
  try {
    await p.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await p.waitForTimeout(500);
    pages.set(url, (await p.title()).replace(/\s+/g, " ").trim());
    const links = await p.$$eval("a[href]", (as) =>
      as.map((a) => ({ href: a.href, text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 110) })));
    for (const raw of links) {
      const href = unwrap(raw.href);
      let u;
      try { u = new URL(href); } catch { continue; }
      if (!/^https?:$/.test(u.protocol)) continue;
      const clean = (u.origin + u.pathname + u.search).replace(/\/$/, "");
      if (SKIP.test(clean)) continue;
      if (ALLOW.includes(u.hostname)) {
        if (!seen.has(clean)) { seen.add(clean); queue.push(clean); }
        if (raw.text.length > 2 && !external.has(clean)) external.set(clean, raw.text);
      } else if (raw.text.length > 2 && !external.has(clean)) {
        external.set(clean, raw.text);
      }
    }
  } catch (e) {
    console.error("skip", url.slice(0, 70), e.message.slice(0, 40));
  }
  if (pages.size % 50 === 0) console.log("...", pages.size, "pages,", queue.length, "queued");
}

const out = process.argv[2];
await writeFile(out + "/sweep-pages.txt", [...pages.entries()].sort().map(([u, t]) => `${u}\t${t}`).join("\n"));
await writeFile(out + "/sweep-links.txt", [...external.entries()].sort().map(([u, t]) => `${u}\t${t}`).join("\n"));
console.log("DONE pages:", pages.size, "| destinations:", external.size);
await b.close();
