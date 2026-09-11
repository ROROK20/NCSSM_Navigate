/**
 * Round-trip the resource directory between TypeScript and CSV.
 *
 *   node scripts/resources-csv.mjs export [out.csv]
 *   node scripts/resources-csv.mjs import <in.csv>
 *
 * The intended workflow: export once to seed a Google Sheet, let SG collect and
 * correct links there where several people can work at once, export the sheet
 * to CSV, import it back, review the diff, commit.
 *
 * `src/content/resources.ts` stays the thing the app reads and the thing code
 * review sees. The spreadsheet is an editing surface, not a second database.
 *
 * Import validates every row and writes nothing at all if any row is bad, so a
 * malformed export cannot half-destroy the directory.
 */

import { readFile, writeFile } from "node:fs/promises";

const FILE = new URL("../src/content/resources.ts", import.meta.url);
const TAXONOMY = new URL("../src/content/taxonomy.ts", import.meta.url);

const COLUMNS = [
  "id",
  "name",
  "description",
  "aliases",
  "category",
  "officialUrl",
  "audience",
  "contactEmail",
  "contactNote",
  "loginRequired",
  "platform",
  "lastVerified",
  "verificationStatus",
  "featured",
];

const VERIFICATION = ["verified", "needs-review", "outdated"];

/* ------------------------------------------------------------------- csv */

function toCsv(rows) {
  const escape = (value) => {
    const text = value === undefined || value === null ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    COLUMNS.join(","),
    ...rows.map((row) => COLUMNS.map((col) => escape(row[col])).join(",")),
  ].join("\n");
}

/** Minimal RFC4180 parser: handles quotes, embedded commas, and newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  const clean = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (quoted) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/* ------------------------------------------------------ read the TS file */

async function readTaxonomyIds(constName) {
  const text = await readFile(TAXONOMY, "utf8");
  const block = text.split(`export const ${constName} = [`)[1]?.split("] as const")[0];
  if (!block) throw new Error(`Could not find ${constName} in taxonomy.ts`);
  return [...block.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);
}

/**
 * Parse the seed array well enough to export it.
 *
 * This reads the literal rather than importing the module, because `node` cannot
 * import TypeScript without a build step and adding one for a maintenance
 * script is not worth it.
 */
function parseResources(text) {
  const body = text.split("export const resources: Resource[] = [")[1];
  if (!body) throw new Error("Could not find the resources array.");

  const rows = [];
  for (const chunk of body.split(/\n  \{\n/).slice(1)) {
    const record = chunk.split(/\n  \},/)[0];
    // The split above consumed the newline after "{", so the first field has
    // no leading newline to anchor against.
    const str = (key) => {
      const m = record.match(
        new RegExp(`(?:^|\\n)    ${key}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`),
      );
      if (!m) return "";
      try {
        return JSON.parse(`"${m[1]}"`);
      } catch {
        return m[1];
      }
    };
    const bool = (key) => new RegExp(`(?:^|\\n)    ${key}: true`).test(record);
    const id = str("id");
    if (!id) continue;
    rows.push({
      id,
      name: str("name"),
      description: str("description"),
      aliases: str("aliases"),
      category: str("category"),
      officialUrl: str("officialUrl"),
      audience: str("audience"),
      contactEmail: str("contactEmail"),
      contactNote: str("contactNote"),
      loginRequired: bool("loginRequired"),
      platform: str("platform"),
      lastVerified: str("lastVerified"),
      verificationStatus: str("verificationStatus"),
      featured: bool("featured"),
    });
  }
  return rows;
}

/* ----------------------------------------------------- write the TS file */

function serialize(rows) {
  // JSON string syntax is a subset of TS string syntax, so this is safe for
  // quotes, backslashes, and newlines alike.
  const q = (value) => JSON.stringify(String(value));

  const record = (row) => {
    const lines = [
      `    id: ${q(row.id)},`,
      `    name: ${q(row.name)},`,
      `    description:\n      ${q(row.description)},`,
    ];
    if (row.aliases) lines.push(`    aliases:\n      ${q(row.aliases)},`);
    lines.push(`    category: ${q(row.category)},`);
    lines.push(`    officialUrl: ${q(row.officialUrl)},`);
    if (row.audience) lines.push(`    audience: ${q(row.audience)},`);
    if (row.contactEmail) lines.push(`    contactEmail: ${q(row.contactEmail)},`);
    if (row.contactNote) lines.push(`    contactNote: ${q(row.contactNote)},`);
    lines.push(`    loginRequired: ${row.loginRequired},`);
    lines.push(`    platform: ${q(row.platform)},`);
    lines.push(
      `    lastVerified: ${row.lastVerified ? q(row.lastVerified) : "null"},`,
    );
    lines.push(`    verificationStatus: ${q(row.verificationStatus)},`);
    if (row.featured) lines.push(`    featured: true,`);
    return `  {\n${lines.join("\n")}\n  },`;
  };

  return `import type { Resource } from "./types";

/**
 * The resource directory.
 *
 * GENERATED by \`npm run resources:import\`. Edit this file by hand, or edit the
 * spreadsheet and re-import; either works, but do not do both at once.
 *
 * Editing rules:
 *  - \`officialUrl\` must be the school's own address. Never mirror, proxy, or
 *    re-host content that sits behind an NCSSM login.
 *  - Set \`loginRequired: true\` whenever the destination asks for an NCSSM
 *    account, and let the student authenticate on that platform.
 *  - \`contactEmail\` is for offices and departments only, never an individual
 *    student.
 *  - \`aliases\` is the words a student would actually type. It is invisible on
 *    the page and exists only so search finds the row. When someone says they
 *    could not find something, add what they searched for here.
 */
export const resources: Resource[] = [
${withSectionComments(rows, record)}
];
`;
}

/**
 * Emit a banner comment whenever the category changes, so a regenerated file
 * scans as easily as a hand-written one. Row order is preserved exactly; this
 * only annotates it.
 */
function withSectionComments(rows, record) {
  const out = [];
  let current = null;
  for (const row of rows) {
    if (row.category !== current) {
      current = row.category;
      const dashes = "-".repeat(Math.max(3, 68 - current.length));
      out.push(`  /* ${dashes} ${current} */`);
    }
    out.push(record(row));
  }
  return out.join("\n");
}

/* ------------------------------------------------------------------ main */

const [mode, arg] = process.argv.slice(2);
const text = await readFile(FILE, "utf8");

if (mode === "export") {
  const rows = parseResources(text);
  const out = arg ?? "resources.csv";
  await writeFile(out, toCsv(rows), "utf8");
  console.log(`Exported ${rows.length} resources to ${out}`);
  console.log("Upload it to a Google Sheet, edit there, then export back to CSV.");
} else if (mode === "import") {
  if (!arg) {
    console.error("Usage: node scripts/resources-csv.mjs import <in.csv>");
    process.exit(1);
  }

  const [categories, platforms] = await Promise.all([
    readTaxonomyIds("RESOURCE_CATEGORIES"),
    readTaxonomyIds("PLATFORMS"),
  ]);

  const grid = parseCsv(await readFile(arg, "utf8"));
  const header = grid[0].map((h) => h.trim());
  const missing = ["id", "name", "description", "category", "officialUrl", "platform"]
    .filter((col) => !header.includes(col));
  if (missing.length) {
    console.error(`CSV is missing required column(s): ${missing.join(", ")}`);
    process.exit(1);
  }

  const truthy = (v) => /^(true|yes|y|1|x)$/i.test(String(v ?? "").trim());
  const errors = [];
  const seen = new Set();
  const rows = [];

  grid.slice(1).forEach((cells, index) => {
    const line = index + 2;
    const get = (col) => (cells[header.indexOf(col)] ?? "").trim();
    const row = {
      id: get("id"),
      name: get("name"),
      description: get("description"),
      aliases: get("aliases"),
      category: get("category"),
      officialUrl: get("officialUrl"),
      audience: get("audience"),
      contactEmail: get("contactEmail"),
      contactNote: get("contactNote"),
      loginRequired: truthy(get("loginRequired")),
      platform: get("platform"),
      lastVerified: get("lastVerified"),
      verificationStatus: get("verificationStatus") || "needs-review",
      featured: truthy(get("featured")),
    };

    const bad = (message) => errors.push(`  line ${line}: ${message}`);

    if (!row.id) bad("id is required");
    else if (!/^[a-z0-9][a-z0-9-]*$/.test(row.id))
      bad(`id "${row.id}" must be lowercase letters, digits, and hyphens`);
    else if (seen.has(row.id)) bad(`duplicate id "${row.id}"`);
    else seen.add(row.id);

    if (!row.name) bad("name is required");
    if (!row.description) bad("description is required");
    if (!categories.includes(row.category))
      bad(`category "${row.category}" is not in taxonomy.ts (${categories.join(", ")})`);
    if (!platforms.includes(row.platform))
      bad(`platform "${row.platform}" is not in taxonomy.ts (${platforms.join(", ")})`);
    if (!/^(https?:\/\/\S+|\/\S*)$/.test(row.officialUrl))
      bad(`officialUrl "${row.officialUrl}" must be an http(s) URL or a site path`);
    if (!VERIFICATION.includes(row.verificationStatus))
      bad(`verificationStatus "${row.verificationStatus}" must be one of ${VERIFICATION.join(", ")}`);
    if (row.lastVerified && !/^\d{4}-\d{2}-\d{2}$/.test(row.lastVerified))
      bad(`lastVerified "${row.lastVerified}" must be YYYY-MM-DD or empty`);

    rows.push(row);
  });

  if (errors.length) {
    console.error(`Refusing to import. ${errors.length} problem(s):\n`);
    console.error(errors.join("\n"));
    console.error("\nNothing was written. Fix the CSV and run again.");
    process.exit(1);
  }

  await writeFile(FILE, serialize(rows), "utf8");
  console.log(`Imported ${rows.length} resources into src/content/resources.ts`);
  console.log("Next: git diff to review, npm run check:links, then commit.");
} else {
  console.error("Usage: node scripts/resources-csv.mjs export|import [file]");
  process.exit(1);
}
