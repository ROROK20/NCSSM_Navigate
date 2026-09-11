import "server-only";
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";

/**
 * Tiny JSON/JSONL store.
 *
 * Navigate has no database. Everything it needs to persist is a handful of
 * kilobytes, so it writes to a directory on disk.
 *
 * On a host with a writable disk (a VM, a container, `next start`, Railway,
 * Render, Fly) this survives restarts. On a read-only serverless filesystem the
 * first write fails, and the store falls back to a per-instance memory cache.
 * That fallback is reported through `storageMode()`, surfaced in the admin page
 * and used by the issue API to decide whether it can honestly accept a
 * submission. Nothing silently pretends to have saved.
 *
 * Swapping this file for a database client is the intended upgrade path: the
 * rest of the app only calls readJson / writeJson / appendLine / readLines.
 */

const DATA_DIR =
  process.env.NAVIGATE_DATA_DIR ??
  path.join(/* turbopackIgnore: true */ process.cwd(), ".data");

export type StorageMode = "file" | "memory";

/** Per-process fallback used only after a disk write has actually failed. */
const memory = new Map<string, string>();
let mode: StorageMode = "file";
let lastError: string | null = null;

export function storageMode() {
  return { mode, dataDir: DATA_DIR, lastError };
}

function degrade(error: unknown) {
  mode = "memory";
  lastError = error instanceof Error ? error.message : String(error);
  console.warn(
    `[navigate] disk write failed, falling back to in-memory storage: ${lastError}`,
  );
}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

/* -------------------------------------------------------------- JSON docs */

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  const cached = memory.get(file);
  if (mode === "memory") {
    return cached ? (JSON.parse(cached) as T) : fallback;
  }
  try {
    const raw = await readFile(path.join(/* turbopackIgnore: true */ DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    // A missing file is the normal first-run case, not a problem.
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return fallback;
    console.warn(`[navigate] could not read ${file}:`, error);
    return cached ? (JSON.parse(cached) as T) : fallback;
  }
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value, null, 2);
  memory.set(file, serialized);
  if (mode === "memory") return;
  try {
    await ensureDir();
    await writeFile(path.join(/* turbopackIgnore: true */ DATA_DIR, file), serialized, "utf8");
  } catch (error) {
    degrade(error);
  }
}

/* ------------------------------------------------------------ JSONL lines */

/** Append one record. Used for submissions so a write never rewrites history. */
export async function appendLine(file: string, value: unknown): Promise<void> {
  const line = `${JSON.stringify(value)}\n`;
  memory.set(file, (memory.get(file) ?? "") + line);
  if (mode === "memory") return;
  try {
    await ensureDir();
    await appendFile(path.join(/* turbopackIgnore: true */ DATA_DIR, file), line, "utf8");
  } catch (error) {
    degrade(error);
  }
}

export async function readLines<T>(file: string): Promise<T[]> {
  const parse = (raw: string) =>
    raw
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .flatMap((line) => {
        try {
          return [JSON.parse(line) as T];
        } catch {
          // One corrupt line should not take down the whole admin page.
          return [];
        }
      });

  if (mode === "memory") return parse(memory.get(file) ?? "");
  try {
    return parse(await readFile(path.join(/* turbopackIgnore: true */ DATA_DIR, file), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    console.warn(`[navigate] could not read ${file}:`, error);
    return parse(memory.get(file) ?? "");
  }
}

export async function replaceLines(file: string, rows: unknown[]) {
  const serialized = rows.map((row) => `${JSON.stringify(row)}\n`).join("");
  memory.set(file, serialized);
  if (mode === "memory") return;
  try {
    await ensureDir();
    await writeFile(path.join(/* turbopackIgnore: true */ DATA_DIR, file), serialized, "utf8");
  } catch (error) {
    degrade(error);
  }
}

/**
 * Probe once at startup so the admin page can warn before an editor loses work,
 * rather than after. Safe to call repeatedly.
 */
export async function probeStorage(): Promise<StorageMode> {
  if (mode === "memory") return mode;
  try {
    await ensureDir();
    await writeFile(path.join(/* turbopackIgnore: true */ DATA_DIR, ".write-test"), "ok", "utf8");
    return "file";
  } catch (error) {
    degrade(error);
    return "memory";
  }
}
