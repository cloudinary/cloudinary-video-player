import VideoSource from '../src/plugins/cloudinary/models/video-source.js';
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
});


