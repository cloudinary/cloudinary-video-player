window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var player = cld.videoPlayer('player');

  var source = { publicId: 'snow_horses', info: { title: 'Snow Horses', subtitle: 'A movie about horses' } };

  player.source(source).play();

  document.querySelector('button#toggle-fluid').addEventListener('click', function() {
    var isFluid = !player.fluid();
    player.fluid(isFluid);

    this.innerText = isFluid ? 'Disable Fluid' : 'Enable Fluid';
  });

}, false);
