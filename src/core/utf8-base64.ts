/** Base64 of the UTF-8 bytes of `value`, standard alphabet (`+`, `/`, `=`), as v4 `utf8ToBase64` (video-service public IDs). */
export function utf8ToBase64(value: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}
