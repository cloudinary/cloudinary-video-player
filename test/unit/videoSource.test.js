import VideoSource from '../../src/plugins/cloudinary/models/video-source/video-source.js';
import { isCodecAlreadyExist } from '../../src/plugins/cloudinary/models/video-source/video-source.utils';
import '../../src/';
const cld = { cloud_name: 'demo' };

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
    let tr = {
      fetch_format: 'auto'
    };
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
      cloudinaryConfig: cld,
      sourceTypes: ['webm']
    };
    let url = 'https://exmaple.com/test.mp4';
    let source = new VideoSource(url, sourceDef);
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
    expect(srcs[0].type).toEqual(null);
    expect(srcs[0].isAdaptive).toEqual(false);
  });
  it('Test raw url with transformations', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://media.castit.biz/castit-dev/video/upload/a_0,c_limit,f_mp4,vc_h264,w_600/cit-qa/Videoback/2020/08/03/269085_358976.mp4';
    let source = new VideoSource(url, sourceDef);
    let srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].type).toEqual(null);
    expect(srcs[0].isAdaptive).toEqual(false);
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

  it('Test raw url adaptive m3u8', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test.m3u8';
    let source = new VideoSource(url, sourceDef);
    let srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/x-mpegURL');
  });
  it('Test raw url adaptive hls', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test';
    let source = new VideoSource(url, sourceDef);
    source.sourceTypes(['hls']);
    let srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/x-mpegURL');
  });
  it('Test raw url adaptive mpd', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test.mpd';
    let source = new VideoSource(url, sourceDef);
    let srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/dash+xml');
  });
  it('Test raw url adaptive dash', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test';
    let source = new VideoSource(url, sourceDef);
    source.sourceTypes(['dash']);
    let srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/dash+xml');
  });
  it('Should not break when calling generateSources() more then once', () => {
    let sourceDef = {
      cloudinaryConfig: cld
    };
    let url = 'https://exmaple.com/test';
    let source = new VideoSource(url, sourceDef);
    source.sourceTypes(['hls']);
    source.generateSources();
    let srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
    expect(srcs[0].isAdaptive).toEqual(true);
    expect(srcs[0].type).toEqual('application/x-mpegURL');
  });
});
describe('tests withCredentials', () => {
  it('test withCredentials true', () => {
    let sourceDef = {
      cloudinaryConfig: cld,
      withCredentials: true
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['webm']);
    let srcs = source.generateSources().map(s => s.withCredentials);
    expect(srcs[0]).toEqual(true);
  });
  it('test withCredentials false', () => {
    let sourceDef = {
      cloudinaryConfig: cld,
      withCredentials: false
    };
    let source = new VideoSource('sea_turtle', sourceDef);
    source.sourceTypes(['webm']);
    let srcs = source.generateSources().map(s => s.withCredentials);
    expect(srcs[0]).toEqual(false);
  });
});


describe('test isCodecAlreadyExist method', () => {

  describe('test has codec in raw transformation', () => {

    it('should codec already exist', () => {
      expect(isCodecAlreadyExist(null, 'vc_vp9,q_auto')).toEqual(true);
    });

    it('should codec not exist', () => {
      expect(isCodecAlreadyExist(null, 'q_auto')).toEqual(false);
    });
  });


  describe('test has codec in transformation object', () => {

    it('codec exist in transformation object', () => {
      const transformations = {
        video_codec: 'vp9'
      };

      expect(isCodecAlreadyExist(transformations)).toEqual(true);
    });

    it('codec NOT exist in transformation object', () => {

      const transformations = {
        quality: 'auto'
      };

      expect(isCodecAlreadyExist(transformations)).toEqual(false);
    });
  });

  describe('test if codec exist in transformations array', () => {

    it('codec exist in transformation array', () => {
      const transformations = [
        ['vc_vp9,q_auto']
      ];

      expect(isCodecAlreadyExist(transformations)).toEqual(true);
    });


    it('codec NOT exist in transformation array', () => {
      const transformations = [{ transformation: ['q_auto'] }];

      expect(isCodecAlreadyExist(transformations)).toEqual(false);
    });

  });


  describe('should generated codec in source url', () => {

    it('should get default code', () => {

      const source = new VideoSource('sea_turtle', {
        cloudinaryConfig: cld
      });

      const srcs = source.generateSources();
      expect(srcs[0].src).toEqual('http://res.cloudinary.com/demo/video/upload/vc_vp9/sea_turtle.webm');
    });

    it('check if codec has NOT bee added to the ur twice', () => {

      const source = new VideoSource('sea_turtle', {
        cloudinaryConfig: cld,
        transformation: {
          video_codec: 'vp9'
        }
      });

      const srcs = source.generateSources();
      expect(srcs[0].src).toEqual('http://res.cloudinary.com/demo/video/upload/vc_vp9/sea_turtle.webm');
    });

    it('check if codec has been changed', () => {

      const source = new VideoSource('sea_turtle', {
        cloudinaryConfig: cld,
        transformation: {
          video_codec: 'h265'
        }
      });

      const srcs = source.generateSources();
      expect(srcs[0].src).toEqual('http://res.cloudinary.com/demo/video/upload/vc_h265/sea_turtle.webm');
    });


    it('check if codec has been NOT add twice using raw_transformation', () => {

      const source = new VideoSource('sea_turtle', {
        cloudinaryConfig: cld,
        raw_transformation: 'vc_vp9'
      });

      const srcs = source.generateSources();
      expect(srcs[0].src).toEqual('http://res.cloudinary.com/demo/video/upload/vc_vp9/sea_turtle.webm');
    });

    it('check if codec has been change using raw_transformation', () => {

      const source = new VideoSource('sea_turtle', {
        cloudinaryConfig: cld,
        raw_transformation: 'h265'
      });

      const srcs = source.generateSources();
      expect(srcs[0].src).toEqual('http://res.cloudinary.com/demo/video/upload/h265/sea_turtle.webm');
    });


    it('check array of transformations without codec', () => {

      const source = new VideoSource('sea_turtle', {
        cloudinaryConfig: cld,
        transformation: [
          { width: 400 }
        ]
      });

      const srcs = source.generateSources();
      expect(srcs[0].src).toEqual('http://res.cloudinary.com/demo/video/upload/w_400/vc_vp9/sea_turtle.webm');
    });

    it('check array of transformations with codec', () => {

      const source = new VideoSource('sea_turtle', {
        cloudinaryConfig: cld,
        transformation: [
          { video_codec: 'h265' }
        ]
      });

      const srcs = source.generateSources();
      expect(srcs[0].src).toEqual('http://res.cloudinary.com/demo/video/upload/vc_h265/sea_turtle.webm');
    });


  });

});


