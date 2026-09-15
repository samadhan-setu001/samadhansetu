/**
 * Client-side SHA-256 helper.
 *
 * In production, section 11.3 of the design doc computes the *chained*
 * record_hash server-side, inside the resolution-submit Edge Function,
 * because it needs the previous hash for the complaint and must not be
 * forgeable by the client:
 *
 *   record_hash = SHA256(
 *     complaint_id + officer_id + after_photo_hash + lat + long +
 *     resolved_at + previous_hash_for_this_complaint
 *   )
 *
 * This helper is used here only to (a) hash the after-photo client-side
 * before upload so the Edge Function can verify nothing changed in transit,
 * and (b) to fake a plausible-looking hash in the mock data layer so the UI
 * has something real to display before the real function is wired up.
 */
export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashBlob(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  return sha256Hex(buf);
}
