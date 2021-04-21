window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var player = cld.videoPlayer('player');

  var source = { publicId: 'dog', 'sourceTypes': ['audio'] };

  player.source(source);

  var player_t = cld.videoPlayer('player-t');

  var sourceTransformation = {
    publicId: 'dog',
    'sourceTypes': ['audio'],
    transformation: {
      start_offset: 3,
      duration: 5
    }
  };

  player_t.source(sourceTransformation);

}, false);
