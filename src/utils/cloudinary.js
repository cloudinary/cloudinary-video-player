import Promise from 'promise-polyfill';
import fetchPF from 'fetch-ponyfill/build/fetch-browser';
import { cloudinaryErrorsConverter } from '../plugins/cloudinary/common';

const { fetch } = fetchPF({ Promise });

const GET_ERROR_DEFAULT_REQUEST = { method: 'get', headers: { 'Content-Range': 'bytes=0-0' } };
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
          let parsedUri = parseUri(r.url);
          filtered.push(parsedUri.host + parsedUri.path);
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
        let goodSrcs = srcs.filter(s => {
          let origUrl = parseUri(s.src);
          return filtered.indexOf(origUrl.host + origUrl.path) !== -1;
        });
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

// for IE 11
function parseUri (str) {
  let o = {
    strictMode: false,
    key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
    q: {
      name: 'queryKey',
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };
  let m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str);
  let uri = {};
  let i = 14;

  while (i--) {
    uri[o.key[i]] = m[i] || '';
  }

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) {
      uri[o.q.name][$1] = $2;
    }
  });

  return uri;
}

function getCloudinaryInstanceOf(Klass, obj) {
  if (obj instanceof Klass) {
    return obj;
  } else {
    return new Klass(obj);
  }
}

export { getCloudinaryInstanceOf, handleCldError };
