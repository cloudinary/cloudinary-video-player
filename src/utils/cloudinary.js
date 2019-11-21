import Promise from 'promise-polyfill';
import fetchPF from 'fetch-ponyfill/build/fetch-browser';
import { cloudinaryErrorsConverter } from '../plugins/cloudinary/common';
const { fetch } = fetchPF({ Promise });

const getCldError = (url, that) => {
  fetch(url.src).then((res) => {
    if (res.status < 200 || res.status > 299) {
      that.videojs.error(null);
      const errorMsg = res.headers.get('x-cld-error') || '';
      const cloudName = that.cloudinaryConfig().config().cloud_name;
      that.videojs.error(cloudinaryErrorsConverter({
        errorMsg,
        publicId: that.currentPublicId(),
        cloudName,
        error: res,
        statusCode: res.status
      }));
      that.videojs.reset();
      fallbackThroughSources(that);
    }
  });
};

function fallbackThroughSources(that) {
  let srcs = that.videojs.cloudinary.getCurrentSources();
  if (srcs.length > 0) {
    let src = srcs.shift();
    console.log(JSON.stringify(src));
    that.videojs.src(src);
  }
}


function getCloudinaryInstanceOf(Klass, obj) {
  if (obj instanceof Klass) {
    return obj;
  } else {
    return new Klass(obj);
  }
}

export { getCloudinaryInstanceOf, getCldError };
