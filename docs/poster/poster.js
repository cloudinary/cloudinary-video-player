window.addEventListener('load', function () {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  cld.videoPlayer('player-image-poster', {
    publicId: 'snow_horses'
  });

  cld.videoPlayer('player-frame-0', {
    publicId: 'snow_horses',
    posterOptions: {
      transformation: {
        startOffset: '0'
      }
    }
  });

  cld.videoPlayer('player-poster-options', {
    publicId: 'snow_horses'
  });

}, false);
