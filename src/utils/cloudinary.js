import Promise from 'promise-polyfill';
import fetchPF from 'fetch-ponyfill/build/fetch-browser';
import { cloudinaryErrorsConverter } from '../plugins/cloudinary/common';

const { fetch } = fetchPF({ Promise });

const GET_ERROR_DEFAULT_REQUEST = { method: 'head' };
const ERROR_WITH_GET_REQUEST = { method: 'get', credentials: 'include', headers: { 'Content-Range': 'bytes=0-0' } };
const handleCldError = (that, options) => {
  const cloudName = that.cloudinaryConfig().config().cloud_name;
  const opts = (options.fetchErrorUsingGet) ? ERROR_WITH_GET_REQUEST : GET_ERROR_DEFAULT_REQUEST;
  let srcs = that.videojs.cloudinary.getCurrentSources();
  if (srcs.length > 0) {
    Promise.all(srcs.map((s) => fetch(s.src, opts))).then((res) => {
      let filtered = [];
      res.forEach(r => {
        if (r.status >= 200 && r.status < 399 && r.url !== '') {
          filtered.push(r.url);
        }
      });
      if (filtered.length === 0) {
        const errorMsg = res[0].headers.get('x-cld-error') || '';
        that.videojs.error(cloudinaryErrorsConverter({
          errorMsg,
          publicId: that.currentPublicId(),
          cloudName,
          error: res[0],
          statusCode: res[0].status
        }));
      } else {
        let goodSrcs = srcs.filter(s => filtered.indexOf(s.src) > -1);
        if (goodSrcs && goodSrcs.length) {
          console.log('Trying urls: ' + JSON.stringify(goodSrcs));
          that.videojs.src(goodSrcs);
          that.play();
        } else {
          console.log('No urls left to try so stopping');
          that.videojs.error({ code: 6, message: 'No supported media sources' });
        }
      }
    })
      .catch(error => that.videojs.error({
        code: 7,
        message: error && error.message ? error.message : 'Failed to test sources'
      }));
  } else {
    that.videojs.error({ code: 6, message: 'No supported media sources' });
  }
};

function getCloudinaryInstanceOf(Klass, obj) {
  if (obj instanceof Klass) {
    return obj;
  } else {
    return new Klass(obj);
  }
}

export { getCloudinaryInstanceOf, handleCldError };
