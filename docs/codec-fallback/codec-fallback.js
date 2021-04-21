window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });
  var uap = new window.UAParser(navigator.userAgent);

  var player = cld.videoPlayer('player', {
    publicId: 'product-gallery-tutorial_hlk0na',
    info: { title: 'Video too big cached' }
  });

  var browserName = uap.getBrowser().name + ' is playing ';

  player.videojs.on('playing', function() {
    document.getElementById('cached-info').innerText = browserName + player.videojs.currentSrc();
  });

  var playerWebm = cld.videoPlayer('player-webm', {
    publicId: 'product-gallery-tutorial_hlk0na',
    info: { title: 'Video too big cached' },
    sourceTypes: ['webm']
  });

  playerWebm.videojs.on('playing', function() {
    document.getElementById('cached-info-webm').innerText = browserName + playerWebm.videojs.currentSrc();
  });

  cld.videoPlayer('player-too-big', {
    publicId: 'Image_Performance',
    info: { title: 'Video too big to transcode' }
  });

  var playerSmall = cld.videoPlayer('player-small', {
    publicId: 'what_is_cloudinary_sd',
    info: { title: 'Small video' }
  });

  playerSmall.videojs.on('playing', function() {
    document.getElementById('small-info').innerText = browserName + playerSmall.videojs.currentSrc();
  });

}, false);
