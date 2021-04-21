window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var player = cld.videoPlayer('player', {
    analytics: { // Enable player analytics
      events: [
        'play',
        'pause',
        'volumechange',
        { // Some events may have additional settings
          type: 'percentsplayed',
          percents: [10, 50, 75, 100]
        },
        'start',
        'ended',
        'seek',
        'fullscreenchange'
      ]
    }
  });

  var source = { publicId: 'marmots', info: { title: 'marmots', subtitle: 'marmots subtitle', description: 'lorem ipsum marmots' } };

  player.source(source).play();
}, false);
