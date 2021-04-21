window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  cld.videoPlayers('.cld-video-player', {
    autoplay: true,
    controls: true,
    transformation: { width: 500, crop: 'limit' }
  });

}, false);
