/**
 * CSV primitives shared by the content round-trip scripts.
 *
 * Extracted when the second dataset needed them. There is exactly one parser
 * in the repo on purpose: a spreadsheet that imports cleanly through one
 * script and mangles quotes through another is the kind of bug that only
 * surfaces after someone has spent an evening typing into it.
 */

/** Serialize rows to RFC4180 CSV, one column per entry in `columns`. */
export function toCsv(columns, rows) {
  const escape = (value) => {
    const text = value === undefined || value === null ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((col) => escape(row[col])).join(",")),
  ].join("\n");
}

/** Minimal RFC4180 parser: handles quotes, embedded commas, and newlines. */
export function parseCsv(text) {
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

/** Spreadsheet truthiness. Accepts what a person actually types in a cell. */
export const truthy = (value) => /^(true|yes|y|1|x)$/i.test(String(value ?? "").trim());

/**
 * Opening hours in one CSV cell.
 *
 * `days|period|time`, windows separated by `;`. One line per window rather
 * than a nested structure, because a cell has to stay editable by hand:
 *
 *   Monday to Friday|Breakfast|7:45am - 10:00am;Saturday and Sunday|Brunch|10:30am - 1:00pm
 */
export function encodeHours(rows) {
  if (!rows || rows.length === 0) return "";
  return rows.map((row) => [row.days, row.period, row.time].join("|")).join(";");
}

/**
 * Returns `{ rows, errors }`. A malformed cell yields errors and no rows, so
 * the caller can refuse the whole import rather than write half a schedule.
 */
export function decodeHours(cell) {
  const text = String(cell ?? "").trim();
  if (!text) return { rows: [], errors: [] };

  const rows = [];
  const errors = [];
  for (const chunk of text.split(";")) {
    if (!chunk.trim()) continue;
    const parts = chunk.split("|").map((part) => part.trim());
    if (parts.length !== 3) {
      errors.push(`hours entry "${chunk.trim()}" must be days|period|time`);
      continue;
    }
    const [days, period, time] = parts;
    if (!days) errors.push(`hours entry "${chunk.trim()}" is missing the day range`);
    if (!time) errors.push(`hours entry "${chunk.trim()}" is missing the time`);
    if (days && time) rows.push({ days, period, time });
  }
  return { rows, errors };
}
