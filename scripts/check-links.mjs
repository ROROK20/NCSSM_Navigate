/**
 * Link checker for the resource and opportunity directories.
 *
 * Answers one question fast: which of these URLs are dead? It cannot tell you
 * whether a link points at the *right* page, which is still a human job in
 * /admin. It does turn "30 unverified links" into a short list worth opening.
 *
 *   node scripts/check-links.mjs
 *   node scripts/check-links.mjs --json > link-report.json
 *
 * Exits non-zero when anything is broken, so CI can fail on it.
 */

import { readFile } from "node:fs/promises";

const JSON_OUT = process.argv.includes("--json");
const TIMEOUT_MS = 12_000;
const CONCURRENCY = 6;

/**
 * Pull URLs out of the content files by regex rather than importing them.
 * These are TypeScript modules, and a plain `node` run cannot import those
 * without a build step; the shapes here are simple enough that this is the
 * cheaper trade.
 */
async function collect() {
  const targets = [
    ["resources", "src/content/resources.ts", /id: "([^"]+)"[\s\S]*?officialUrl: "([^"]+)"/g],
    ["opportunities", "src/content/opportunities.ts", /id: "([^"]+)"[\s\S]*?registrationUrl: "([^"]+)"/g],
    ["sg documents", "src/content/site.ts", /id: "([^"]+)",\s*\n\s*title: "[^"]*",[\s\S]*?url: "(https?:[^"]+)"/g],
  ];

  const rows = [];
  for (const [source, file, pattern] of targets) {
    let text;
    try {
      text = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    } catch {
      continue;
    }
    // Split on record boundaries so a greedy match cannot pair one record's id
    // with the next record's URL.
    for (const chunk of text.split(/\n  \{\n/)) {
      pattern.lastIndex = 0;
      const match = pattern.exec(chunk);
      if (!match) continue;
      const [, id, url] = match;
      if (!url.startsWith("http")) continue;
      rows.push({ source, id, url });
    }
  }
  return rows;
}

async function check({ source, id, url }) {
  const started = Date.now();
  const attempt = async (method) =>
    fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "NCSSM-Navigate-LinkChecker/1.0" },
    });

  try {
    let response = await attempt("HEAD");
    // Plenty of sites refuse HEAD but serve GET fine.
    if (response.status === 405 || response.status === 403 || response.status === 501) {
      response = await attempt("GET");
    }
    return {
      source,
      id,
      url,
      status: response.status,
      ok: response.ok,
      ms: Date.now() - started,
      finalUrl: response.url !== url ? response.url : undefined,
    };
  } catch (error) {
    return {
      source,
      id,
      url,
      status: 0,
      ok: false,
      ms: Date.now() - started,
      error: error instanceof Error ? error.message : "unknown error",
    };
  }
}

async function pool(items, worker, size) {
  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index]);
      }
    }),
  );
  return results;
}

const rows = await collect();
if (rows.length === 0) {
  console.error("No URLs found. Did the content files move?");
  process.exit(1);
}

const results = await pool(rows, check, CONCURRENCY);
const broken = results.filter((r) => !r.ok);
const redirected = results.filter((r) => r.ok && r.finalUrl);

if (JSON_OUT) {
  console.log(JSON.stringify({ checked: results.length, broken, redirected, results }, null, 2));
} else {
  console.log(`Checked ${results.length} links.\n`);

  if (broken.length) {
    console.log(`BROKEN (${broken.length}) — open these and fix or mark outdated in /admin:`);
    for (const r of broken) {
      const why = r.error ? r.error : `HTTP ${r.status}`;
      console.log(`  [${r.source}] ${r.id}\n      ${r.url}\n      ${why}`);
    }
    console.log("");
  }

  if (redirected.length) {
    console.log(`REDIRECTED (${redirected.length}) — still work, but update to the final URL:`);
    for (const r of redirected) {
      console.log(`  [${r.source}] ${r.id}\n      ${r.url}\n   -> ${r.finalUrl}`);
    }
    console.log("");
  }

  if (!broken.length && !redirected.length) {
    console.log("Every link resolved, with no redirects.");
  }
  console.log(
    "\nReminder: this only proves a page exists. Whether it is the RIGHT page\n" +
      "is still a human check in /admin.",
  );
}

process.exit(broken.length ? 1 : 0);
