import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Editor authentication.
 *
 * This is a shared-secret gate for the handful of SG officers who maintain
 * content. It is deliberately NOT a student login: students never sign in to
 * Navigate at all, and nobody is ever asked for a school password here.
 *
 * The cookie holds an expiry plus an HMAC over it, so a stolen cookie cannot be
 * extended and the password itself is never stored in the browser.
 *
 * When Google OAuth is added later this module is the seam to replace: swap
 * `readSession` for an OIDC session lookup and keep the rest of the admin code
 * unchanged. Restricting sign-in to approved NCSSM domains belongs in that
 * implementation, driven by configuration rather than a hardcoded domain.
 */

const COOKIE = "navigate_editor";
const TTL_MS = 12 * 60 * 60 * 1000; // One school day.

function password() {
  return process.env.ADMIN_PASSWORD ?? "";
}

/** Falls back to the password so a single env var is enough to get running. */
function secret() {
  return process.env.ADMIN_SESSION_SECRET || password();
}

/** Admin is off unless an editor password is configured. No default exists. */
export function adminConfigured() {
  return password().length >= 12;
}

/** Constant-time comparison, so a wrong guess leaks nothing through timing. */
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    // Still burn a comparison so the failure path is not obviously faster.
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function checkPassword(candidate: string) {
  return adminConfigured() && safeEqual(candidate, password());
}

/* ----------------------------------------------------------------- token */

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function mintToken(now = Date.now()) {
  const expiry = String(now + TTL_MS);
  return `${expiry}.${sign(expiry)}`;
}

function tokenValid(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;
  if (!safeEqual(signature, sign(expiry))) return false;
  const expiresAt = Number(expiry);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

/* --------------------------------------------------------------- session */

export async function startSession() {
  const store = await cookies();
  store.set(COOKIE, mintToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** True when the current request carries a valid, unexpired editor session. */
export async function isEditor() {
  if (!adminConfigured()) return false;
  const store = await cookies();
  return tokenValid(store.get(COOKIE)?.value);
}

/**
 * Guard for every admin mutation. Throwing rather than returning a flag means a
 * forgotten check fails closed.
 */
export async function requireEditor() {
  if (!(await isEditor())) {
    throw new Error("Not signed in as an editor.");
  }
}
