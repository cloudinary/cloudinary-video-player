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

  it('removes fetch_format auto by default (fl_sprite rejects any format)', () => {
    expect(omitVideoOnlyTransformations({ width: 400, fetch_format: 'auto' })).toEqual({ width: 400 });
  });

  describe('with keepAutoFormat (posters)', () => {
    const keepAuto = { keepAutoFormat: true };

    it('keeps fetch_format auto', () => {
      expect(omitVideoOnlyTransformations({ width: 400, fetch_format: 'auto' }, keepAuto))
        .toEqual({ width: 400, fetch_format: 'auto' });
    });

    it('keeps fetch_format auto in arrays and chained transformations', () => {
      expect(omitVideoOnlyTransformations([{ width: 400 }, { fetch_format: 'auto' }], keepAuto))
        .toEqual([{ width: 400 }, { fetch_format: 'auto' }]);
      expect(omitVideoOnlyTransformations({ transformation: [{ fetch_format: 'auto' }] }, keepAuto))
        .toEqual({ transformation: [{ fetch_format: 'auto' }] });
    });

    it('still removes other formats', () => {
      expect(omitVideoOnlyTransformations({ width: 400, fetch_format: 'mp4', format: 'webm' }, keepAuto))
        .toEqual({ width: 400 });
      expect(omitVideoOnlyTransformations({ fetch_format: 'auto:video' }, keepAuto)).toEqual({});
    });
  });

  it('keeps image-safe keys', () => {
    expect(omitVideoOnlyTransformations({ width: 400, crop: 'limit', video_codec: 'h265' }))
      .toEqual({ width: 400, crop: 'limit' });
  });
});
