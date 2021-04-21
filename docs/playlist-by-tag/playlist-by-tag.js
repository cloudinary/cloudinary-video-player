window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var player = cld.videoPlayer('player', {});

  var sorter = function(a, b) {
    if (a.publicId < b.publicId) {
      return 1;
    }
    if (a.publicId > b.publicId) {
      return -1;
    }
    return 0;
  };

  // Fetch playlist by tag. Since this operation involves an API call
  // the function returns a Promise when the operation completes.
  // The return value is 'player'.
  player.playlistByTag('video_race', {
    sorter: sorter,
    autoAdvance: true,
    repeat: true,
    presentUpcoming: false
  }).then(function(player) {
    var divElem = document.querySelector('div#playlist-data');
    var list = player.playlist().list().map(function(source) {
      return source.publicId();
    }).join(', ');

    divElem.innerText = 'Playlist: ' + list;
  });

}, false);
