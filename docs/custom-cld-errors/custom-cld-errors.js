window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo_err' });

  var player = cld.videoPlayer('player', {
    publicId: 'snow_horses'
  });

  // Add a custom error handler on 'error' event
  player.on('error', function(e) {
    const error = e.Player.videojs.error(); // Get current error

    // Custom error code should be > 99, smaller values might already be used by the player.
    const customErrorCode = 999;

    // Replace current error message with your custom error message
    if (error && error.code !== customErrorCode) {
      var errorContainerText = 'Error:' + error.statusCode + ',' + error.message;

      // Set text under the video player
      let errorContainer = document.querySelector('.error-container');
      errorContainer.innerHTML = errorContainerText;
      errorContainer.style.color = 'red';

      // Set video player custom error message
      player.videojs.error(null); // Stop default error handling
      player.videojs.error({ code: customErrorCode, message: 'My custom error message' }); // Set error
    }
  });

}, false);
