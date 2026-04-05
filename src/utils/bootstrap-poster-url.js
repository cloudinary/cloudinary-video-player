export const getPosterUrl = async (options) => {
  if (typeof options?.poster === 'string' && options.poster.length > 0) {
    return options.poster;
  }
  const cloudName = options?.cloudName || options?.cloud_name || options?.cloudinaryConfig?.cloud_name;
  const publicId = options?.publicId || options?.sourceOptions?.publicId;
  if (cloudName && publicId) {
    const { buildPosterUrl } = await import('./poster-url');
    return buildPosterUrl(cloudName, publicId, options?.cloudinaryConfig || { cloud_name: cloudName });
  }
  throw new Error('lazy requires a poster URL or cloudName and publicId');
};
