window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  cld.videoPlayer('player');

}, false);
