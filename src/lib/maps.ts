/**
 * A keyless Google Maps search link.
 *
 * No address, phone number, or opening time for an off-campus business is
 * stored in this repo. Maps holds all three and keeps them current; a copy here
 * would be one more claim nobody is checking, and the first one to go stale.
 *
 * The URL is derived from the business name rather than stored, so there is no
 * link in the content files that anyone could have invented or mistyped.
 */
export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}
