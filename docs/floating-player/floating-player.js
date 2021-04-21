window.addEventListener('load', function () {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var player = cld.videoPlayer('player', {
    floatingWhenNotVisible: 'right' // or 'left'
  });

  player.source('snow_deer');

}, false);
