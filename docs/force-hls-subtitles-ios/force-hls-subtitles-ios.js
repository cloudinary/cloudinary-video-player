window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });
  var player = cld.videoPlayer('player', {
    html5: {
      hls: {
        overrideNative: true
      }
    }
  });

  player.source(
    'sea_turtle',
    {
      sourceTypes: ['hls'],
      transformation: { streaming_profile: 'hd' },
      textTracks: {
        captions: {
          label: 'English(captions)',
          language: 'en',
          default: true,
          url: 'https://res.cloudinary.com/demo/raw/upload/outdoors.vtt'
        },
        subtitles: [
          {
            label: 'English',
            language: 'en',
            url: 'https://res.cloudinary.com/demo/raw/upload/outdoors.vtt'
          }
        ]
      }
    }
  );

}, false);
