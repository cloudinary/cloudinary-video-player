window.addEventListener('load', function() {
  // Code for creating the VideoJS components
  // ===============================================
  var videojs = window.videojs;

  // Get the ClickableComponent base class from Video.js
  var vjs = videojs.default ? videojs.default : videojs;
  var ClickableComponent = vjs.getComponent('ClickableComponent');

  // Create a common class for playlist buttons
  var PlaylistButton = vjs.extend(ClickableComponent, {

    constructor: function(player, options) {
      var type = options.type;
      if (!type && type !== 'previous' && type !== 'next') {
        throw new Error('Playlist must be either \'previous\' or \'next\'');
      }

      this.type = type;

      // It is important to invoke the superclass before anything else,
      // to get all the features of components out of the box!
      // eslint-disable-next-line prefer-rest-params
      ClickableComponent.apply(this, arguments);
    },

    // The `createEl` function of a component creates its DOM element.
    createEl: function() {
      var typeCssClass = 'vjs-playlist-' + this.type + '-control';

      return vjs.createEl('button', {

        // Prefixing classes of elements within a player with "vjs-"
        // is a convention used in Video.js.
        className: 'vjs-control vjs-playlist-control vjs-button ' + typeCssClass
      });
    }
  });

  // Create the NextButton component
  var NextButton = vjs.extend(PlaylistButton, {

    constructor: function(player) {
      PlaylistButton.apply(this, [player, { type: 'next' }]);
    },

    handleClick: function() {
      PlaylistButton.prototype.handleClick.call(this);

      // Since the component has a VideoJS Player object, we use the internal
      // Cloudinary plugin to reach to the playlist object.
      this.player().cloudinary.playlist().playNext();
    }
  });

  // Create the PreviousButton component
  var PreviousButton = vjs.extend(PlaylistButton, {

    constructor: function(player) {
      PlaylistButton.apply(this, [player, { type: 'previous' }]);
    },

    handleClick: function() {
      PlaylistButton.prototype.handleClick.call(this);
      this.player().cloudinary.playlist().playPrevious();
    }
  });

  // Register the component with Video.js, so it can be used in players.
  vjs.registerComponent('NextButton', NextButton);
  vjs.registerComponent('PreviousButton', PreviousButton);

  // Cloudinary Video Player related code
  // ====================================
  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  // Initialize player with only the controlBar's 'playToggle' and our
  // custom components set.
  var player = cld.videoPlayer('player', {
    videojs: {
      controlBar: { children: ['PreviousButton', 'playToggle', 'NextButton'] }
    }
  });

  player.playlist(
    [
      {
        publicId: 'elephants'
      },
      'sea_turtle'
    ],
    {
      autoAdvance: 0,
      repeat: true
    }
  );

}, false);
