/**
 * Collision-resistant identifier helpers.
 *
 * `crypto.randomUUID` is used where available; a timestamp + random fallback
 * keeps things working in any environment without throwing.
 */
function randomToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Generates an opaque entity id with an optional human-readable prefix. */
export function createId(prefix = 'id'): string {
  return `${prefix}_${randomToken()}`;
}

/**
 * Generates an auto SKU in the form `PRD-482910`.
 * Six digits keeps it readable while making collisions vanishingly unlikely.
 */
export function generateSku(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `PRD-${digits}`;
}
