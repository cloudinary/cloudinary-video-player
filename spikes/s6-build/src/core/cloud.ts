// Fixture: small core helper used by the shell and by features.

/** Delivery prefix for a cloud name. */
export function cloudPrefix(cloudName: string): string {
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}`;
}
