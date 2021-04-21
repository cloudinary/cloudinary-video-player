window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var player = cld.videoPlayer('player-1');

  player.source({
    publicId: 'snow_horses',
    info: { title: 'Snow Horses', subtitle: 'A movie about horses' },
    transformation: [
      { width: 400, crop: 'limit' },
      { effect: 'blur:500' },
      { effect: 'saturation:-100' }
    ]
  });

  cld.videoPlayer('player-2', {
    transformation: [
      { width: 400, crop: 'limit' },
      { effect: 'blur:500' },
      { effect: 'saturation:-100' }
    ]
  });

  cld.videoPlayer('player-3');

}, false);
