/**
 * Detects http(s) profile/config URLs. Split from `video-source.const` so fetch-config
 * does not pull MIME maps and related defaults into the async chunk.
 */
// eslint-disable-next-line no-control-regex
export const URL_PATTERN = RegExp(
  'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)'
);
