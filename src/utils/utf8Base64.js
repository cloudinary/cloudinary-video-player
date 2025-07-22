export function utf8ToBase64(str) {
  const utf8Bytes = new TextEncoder().encode(str);
  const binaryStr = String.fromCharCode(...utf8Bytes);
  return btoa(binaryStr);
}
