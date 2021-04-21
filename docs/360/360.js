
window.loadScript('https://unpkg.com/videojs-vr@1.7.1/dist/videojs-vr.js');

window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'benco' });

  window.player = cld.videoPlayer('player', {
    publicId: '360/Golden-Gate-Bridge',
    sourceTypes: ['mp4'],
    transformation: {
      width: 950,
      vc: 'auto'
    }
  });

  window.player.videojs.vr({ projection: '360' });
}, false);
