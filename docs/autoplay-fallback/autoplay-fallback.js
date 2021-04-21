window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  cld.videoPlayer('player', {
    publicId: 'product-gallery-tutorial_hlk0na'
  });

  cld.videoPlayer('player-no-auto', {
    publicId: 'product-gallery-tutorial_hlk0na'
  });

  var playerAutoProg = cld.videoPlayer('player-auto-prog', {
    publicId: 'product-gallery-tutorial_hlk0na'
  });

  playerAutoProg.play();
}, false);
