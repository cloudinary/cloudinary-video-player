window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var source1 = { publicId: 'snow_horses', info: { title: 'Snow Horses', subtitle: 'A movie about snow horses' } };
  var source2 = { publicId: 'dirt_bike', info: { title: 'Dirt Bike', subtitle: 'A short video of dirt bikes' } };
  var source3 = { publicId: 'marmots', info: { title: 'Marmots' } };

  var player = cld.videoPlayer('player', {
    playlistWidget: {
      direction: 'horizontal',
      total: 4
    }
  });

  var playlistSources = [source1, source2, source3];

  var playlistOptions = {
    autoAdvance: true,
    repeat: true,
    presentUpcoming: 8
  };
    // Auto advance to next video after 0 seconds, repeat the playlist when final video ends, and present upcoming video 8 seconds before the current video ends.
  player.playlist(playlistSources, playlistOptions);

}, false);
