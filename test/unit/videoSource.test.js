import VideoSource from '../../src/plugins/cloudinary/models/video-source.js';
import cloudinary from 'cloudinary-core';
const cld = cloudinary.Cloudinary.new({ cloud_name: 'demo' });

describe('video source tests', () => {
  it('Test transformation input object', () => {
    let sourceDef = {
      cloudinaryConfig: cld,
      transformation: {
        fetch_format: 'auto'
      }
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('f_auto');
  });
  it('Test transformation input array', () => {
    let sourceDef = {
      cloudinaryConfig: cld,
      transformation: [{
        fetch_format: 'auto'
      },
      {
        streaming_profile: 'hd'
      }
      ]
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('f_auto');
    expect(srcs[0]).toContain('sp_hd');
  });
  it('Test transformation input cloudinary transformation', () => {
    let tr = cloudinary.Transformation.new({
      fetch_format: 'auto'
    });
    let sourceDef = {
      cloudinaryConfig: cld,
      transformation: tr
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('f_auto');
  });
  it('Test transformation input string (named transformation)', () => {
    let sourceDef = {
      cloudinaryConfig: cld,
      transformation: 'test'
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('t_test');
  });
});
describe('Adaptive source type tests', () => {
  it('Test hls no codec', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['hls']);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).not.toContain('vc_');
  });
  it('Test hls with codec', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['hls/h265']);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('vc_h265');
  });
  it('Test dash no codec', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['dash']);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).not.toContain('vc_');
  });
  it('Test dash codec', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['dash/vp9']);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('vc_vp9');
  });
  it('Test dash codec + transformation', () => {
    let sourceDef = {
      cloudinaryConfig: cld,
      transformation: [{
        fetch_format: 'auto'
      },
      {
        streaming_profile: 'hd'
      }
      ]
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['dash/vp9']);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).not.toContain('vc_vp9');
    expect(srcs[0]).toContain('f_auto');
    expect(srcs[0]).toContain('sp_hd');
    expect(srcs[0]).toContain('.mpd');
  });
  it('Test hls codec + transformation', () => {
    let sourceDef = {
      cloudinaryConfig: cld,
      transformation: [{
        fetch_format: 'auto'
      },
      {
        streaming_profile: 'hd'
      }
      ]
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['hls/h265']);
    let srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).not.toContain('vc_h265');
    expect(srcs[0]).toContain('f_auto');
    expect(srcs[0]).toContain('sp_hd');
    expect(srcs[0]).toContain('.m3u8');
  });
});
describe('Raw url tests', () => {
  it('Test raw url', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test.mp4';
    let source = new VideoSource(url, sourceDef);
    source.sourceTypes(['webm']);
    let srcs = source.generateSources().map(s => s.src);
    expect(srcs[0]).toEqual(url);
  });
  it('Test raw url without type', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test.mp4';
    let source = new VideoSource(url, sourceDef);
    let srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].type).toEqual('video/mp4');
  });
  it('Test raw url without extension', () => {
    let sourceDef = {
      cloudinaryConfig: cld,
      sourceTypes: ['mp4']
    };
    let url = 'https://exmaple.com/test';
    let source = new VideoSource(url, sourceDef);
    let srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].type).toEqual('video/mp4');
  });
  it('Test raw url with params', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test.mp4?test=1234&user=eeeee&format=webm';
    let source = new VideoSource(url, sourceDef);
    source.sourceTypes(['webm']);
    let srcs = source.generateSources().map(s => s.src);
    expect(srcs[0]).toEqual(url);
  });
  it('Test raw url with anchor', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test.mp4#123454';
    let source = new VideoSource(url, sourceDef);
    source.sourceTypes(['webm']);
    let srcs = source.generateSources().map(s => s.src);
    expect(srcs[0]).toEqual(url);
  });
  it('Test raw url with anchor', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test.mp4#123454';
    let source = new VideoSource(url, sourceDef);
    source.sourceTypes(['webm']);
    let srcs = source.generateSources().map(s => s.src);
    expect(srcs[0]).toEqual(url);
  });
});


