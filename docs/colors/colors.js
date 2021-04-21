window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  cld.videoPlayers('.cld-video-player', {
    autoplay: true,
    controls: true,
    transformation: { width: 700, crop: 'limit' }
    // We use html data-attr to set colors, but you can also do it here:
    // colors: { "base": "#111", "accent": "#03a9f4", "text": "#ffeb3b" }
  });
}, false);
