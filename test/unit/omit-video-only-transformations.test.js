import { omitVideoOnlyTransformations } from '../../src/plugins/cloudinary/common';

describe('omitVideoOnlyTransformations', () => {
  it('removes fetch_format and format from an object', () => {
    expect(omitVideoOnlyTransformations({ width: 400, fetch_format: 'mp4', format: 'mp4' })).toEqual({ width: 400 });
  });

  it('removes fetch_format from an array and drops empty components', () => {
    expect(omitVideoOnlyTransformations([{ width: 400 }, { fetch_format: 'mp4' }])).toEqual([{ width: 400 }]);
  });

  it('removes fetch_format from a chained transformation', () => {
    expect(omitVideoOnlyTransformations({ transformation: [{ width: 400 }, { format: 'mp4' }] }))
      .toEqual({ transformation: [{ width: 400 }] });
  });

  it('keeps image-safe keys', () => {
    expect(omitVideoOnlyTransformations({ width: 400, crop: 'limit', video_codec: 'h265' }))
      .toEqual({ width: 400, crop: 'limit' });
  });
});
