// Video.js sends cookies for remote text tracks only when the media element has
// crossorigin="use-credentials", which also turns every media request into a credentialed
// CORS request that wildcard-CORS hosts reject. Fetching the file ourselves and handing
// Video.js a same-origin Blob URL keeps the cookies on the track request only.
// On failure the original url is returned so Video.js reports the track error as usual.
export const toCredentialedBlobUrl = async (url, blobUrls) => {
  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const blobUrl = URL.createObjectURL(await response.blob());
    blobUrls.add(blobUrl);
    return blobUrl;
  } catch {
    return url;
  }
};

export const revokeBlobUrls = (blobUrls) => {
  blobUrls.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));
  blobUrls.clear();
};
