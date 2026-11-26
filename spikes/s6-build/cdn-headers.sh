#!/bin/sh
# S-6 criterion 3: CORS and content-type headers of published ESM files on
# jsDelivr and unpkg (read-only HEAD requests). Run: sh spikes/s6-build/cdn-headers.sh
# Writes cdn-headers.txt next to this script.
out="$(dirname "$0")/cdn-headers.txt"
: > "$out"
for url in \
  https://cdn.jsdelivr.net/npm/@videojs/html@10.7.0/dist/default/index.js \
  https://unpkg.com/@videojs/html@10.7.0/dist/default/index.js \
  https://cdn.jsdelivr.net/npm/@videojs/html@10.7.0/dist/default/define/video/compat-skin.css \
  https://unpkg.com/@videojs/html@10.7.0/dist/default/define/video/compat-skin.css \
  https://cdn.jsdelivr.net/npm/@videojs/html@10/dist/default/index.js \
  https://unpkg.com/@videojs/html@10/dist/default/index.js; do
  for origin in "" "https://customer.example"; do
    echo "## $url  (Origin: ${origin:-none})" >> "$out"
    if [ -n "$origin" ]; then
      curl -sIL -H "Origin: $origin" "$url"
    else
      curl -sIL "$url"
    fi | grep -iE '^(HTTP/|location|access-control-allow-origin|content-type|cache-control|timing-allow-origin|cross-origin-resource-policy|x-jsd-version)' >> "$out"
    echo >> "$out"
  done
done
cat "$out"
