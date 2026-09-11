/** Join class names, dropping falsy values. Small enough not to need a dep. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
