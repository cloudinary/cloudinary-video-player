// needed for test;
var player = null;

window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  player = cld.videoPlayer('player', {
    publicId: 'snow_horses',
    info: { title: 'Snow Horses', subtitle: 'A movie about horses' },
    hideContextMenu: true,
    logoImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Facebook_Like_React.png',
    logoOnclickUrl: 'https://google.com',
    showLogo: true,
    showJumpControls: true
  });

}, false);
