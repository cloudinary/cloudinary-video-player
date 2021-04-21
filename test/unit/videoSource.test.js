import VideoSource from '../../src/plugins/cloudinary/models/video-source.js';
import cloudinary from 'cloudinary-core';
const cld = cloudinary.Cloudinary.new({ cloud_name: 'demo' });

describe('video source tests', () => {

  it('Test transformation input object', () => {
    const sourceDef = {
      cloudinaryConfig: cld,
      transformation: {
        fetch_format: 'auto'
      }
    };
    const source = new VideoSource('sea_turtle', sourceDef);
    const srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('f_auto');
  });

  it('Test transformation input array', () => {
    const sourceDef = {
      cloudinaryConfig: cld,
      transformation: [{
        fetch_format: 'auto'
      },
      {
        streaming_profile: 'hd'
      }
      ]
    };
    const source = new VideoSource('sea_turtle', sourceDef);
    const srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('f_auto');
    expect(srcs[0]).toContain('sp_hd');
  });

  it('Test transformation input cloudinary transformation', () => {
    const tr = cloudinary.Transformation.new({
      fetch_format: 'auto'
    });
    const sourceDef = {
      cloudinaryConfig: cld,
      transformation: tr
    };
    const source = new VideoSource('sea_turtle', sourceDef);
    const srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('f_auto');
  });

  it('Test transformation input string (named transformation)', () => {
    const sourceDef = {
      cloudinaryConfig: cld,
      transformation: 'test'
    };
    const source = new VideoSource('sea_turtle', sourceDef);
    const srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('t_test');
  });
});

describe('Adaptive source type tests', () => {

  it('Test hls no codec', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };

    const source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['hls']);
    const srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).not.toContain('vc_');
  });

  it('Test hls with codec', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['hls/h265']);
    const srcs = source.generateSources().map(s => s.src);
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
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['dash/vp9']);
    const srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).toContain('vc_vp9');
  });

  it('Test dash codec + transformation', () => {
    const sourceDef = {
      cloudinaryConfig: cld,
      transformation: [{
        fetch_format: 'auto'
      },
      {
        streaming_profile: 'hd'
      }
      ]
    };
    const source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['dash/vp9']);
    const srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).not.toContain('vc_vp9');
    expect(srcs[0]).toContain('f_auto');
    expect(srcs[0]).toContain('sp_hd');
    expect(srcs[0]).toContain('.mpd');
  });

  it('Test hls codec + transformation', () => {
    const sourceDef = {
      cloudinaryConfig: cld,
      transformation: [{
        fetch_format: 'auto'
      },
      {
        streaming_profile: 'hd'
      }
      ]
    };
    const source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['hls/h265']);
    const srcs = source.generateSources().map(s => s.src);
    // eslint-disable-next-line no-unused-expressions
    expect(srcs[0]).not.toContain('vc_h265');
    expect(srcs[0]).toContain('f_auto');
    expect(srcs[0]).toContain('sp_hd');
    expect(srcs[0]).toContain('.m3u8');
  });
});

describe('Raw url tests', () => {

  it('Test raw url', () => {
    const sourceDef = {
      cloudinaryConfig: cld,
      sourceTypes: ['webm']
    };
    const url = 'https://exmaple.com/test.mp4';
    const source = new VideoSource(url, sourceDef);
    const srcs = source.generateSources().map(s => s.src);
    expect(srcs[0]).toEqual(url);
  });

  it('Test raw url without type', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://exmaple.com/test.mp4';
    const source = new VideoSource(url, sourceDef);
    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].type).toEqual(null);
    expect(srcs[0].isAdaptive).toEqual(false);
  });

  it('Test raw url with transformations', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://media.castit.biz/castit-dev/video/upload/a_0,c_limit,f_mp4,vc_h264,w_600/cit-qa/Videoback/2020/08/03/269085_358976.mp4';
    const source = new VideoSource(url, sourceDef);
    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].type).toEqual(null);
    expect(srcs[0].isAdaptive).toEqual(false);
  });

  it('Test raw url without extension', () => {
    const sourceDef = {
      cloudinaryConfig: cld,
      sourceTypes: ['mp4']
    };
    const url = 'https://exmaple.com/test';
    const source = new VideoSource(url, sourceDef);
    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].type).toEqual('video/mp4');
  });

  it('Test raw url with params', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://exmaple.com/test.mp4?test=1234&user=eeeee&format=webm';
    const source = new VideoSource(url, sourceDef);
    source.sourceTypes(['webm']);
    const srcs = source.generateSources().map(s => s.src);
    expect(srcs[0]).toEqual(url);
  });

  it('Test raw url with anchor', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://exmaple.com/test.mp4#123454';
    const source = new VideoSource(url, sourceDef);
    source.sourceTypes(['webm']);
    let srcs = source.generateSources().map(s => s.src);
    expect(srcs[0]).toEqual(url);
  });

  it('Test raw url with anchor', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://exmaple.com/test.mp4#123454';
    const source = new VideoSource(url, sourceDef);
    source.sourceTypes(['webm']);
    const srcs = source.generateSources().map(s => s.src);
    expect(srcs[0]).toEqual(url);
  });

  it('Test raw url adaptive m3u8', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://exmaple.com/test.m3u8';
    const source = new VideoSource(url, sourceDef);
    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/x-mpegURL');
  });

  it('Test raw url adaptive hls', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://exmaple.com/test';
    const source = new VideoSource(url, sourceDef);
    source.sourceTypes(['hls']);
    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/x-mpegURL');
  });

  it('Test raw url adaptive mpd', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://exmaple.com/test.mpd';
    const source = new VideoSource(url, sourceDef);
    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/dash+xml');
  });

  it('Test raw url adaptive dash', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://exmaple.com/test';
    const source = new VideoSource(url, sourceDef);
    source.sourceTypes(['dash']);
    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/dash+xml');
  });

  it('Should not break when calling generateSources() more then once', () => {
    const sourceDef = {
      cloudinaryConfig: cld
    };
    const url = 'https://exmaple.com/test';
    const source = new VideoSource(url, sourceDef);
    source.sourceTypes(['hls']);
    source.generateSources();
    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/x-mpegURL');
  });
});


