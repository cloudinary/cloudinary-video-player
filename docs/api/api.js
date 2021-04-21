window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });
  var options = location.search.split('fetchErrorUsing=')[1] === 'get' ? { fetchErrorUsingGet: true } : {};

  var player = cld.videoPlayer('player', options);

  player.playlist([
    'snow_deer',
    'sea_turtle',
    'snow_horses'
  ], { autoAdvance: 0 }).play();

  // Button 'click' event handlers
  document.querySelector('#vid-seek-minus').addEventListener('click', function() {
    player.currentTime(player.currentTime() - 10);
  });

  document.querySelector('#vid-seek-plus').addEventListener('click', function() {
    player.currentTime(player.currentTime() + 10);
  });

  document.querySelector('#vid-play-prev').addEventListener('click', function() {
    player.playPrevious();
  });

  document.querySelector('#vid-play').addEventListener('click', function() {
    player.play();
  });

  document.querySelector('#vid-play-next').addEventListener('click', function() {
    player.playNext();
  });

  document.querySelector('#vid-pause').addEventListener('click', function() {
    player.pause();
  });

  document.querySelector('#vid-stop').addEventListener('click', function() {
    player.stop();
  });

  document.querySelector('#vid-mute').addEventListener('click', function() {
    player.mute();
  });

  document.querySelector('#vid-unmute').addEventListener('click', function() {
    player.unmute();
  });

  document.querySelector('#vid-volume-minus').addEventListener('click', function() {
    player.volume(player.volume() - 0.1);
  });

  document.querySelector('#vid-volume-plus').addEventListener('click', function() {
    player.volume(player.volume() + 0.1);
  });

  document.querySelector('#vid-maximize').addEventListener('click', function() {
    player.maximize();
  });

  document.querySelector('#vid-toggle-controls').addEventListener('click', function() {
    player.controls(!player.controls());
  });

  // Register to some video player events
  var eventTypes = [
    'play',
    'pause',
    'volumechange',
    'mute',
    'unmute',
    'fullscreenchange',
    'seek',
    'sourcechanged',
    'percentsplayed',
    'ended'
  ];

  var eventsDiv = document.querySelector('#vid-events');

  eventTypes.forEach(function(eventType) {

    player.on(eventType, function(event) {
      var eventStr = eventType;

      if (event.eventData) {
        eventStr = eventStr + ': ' + JSON.stringify(event.eventData);
      }

      var text = document.createTextNode(eventStr);
      var textDiv = document.createElement('div');
      textDiv.appendChild(text);
      eventsDiv.appendChild(textDiv);
      updateEvents();
    });
  });

  function updateEvents() {
    var eventsDiv = document.querySelector('#vid-events');
    eventsDiv.scrollTop = eventsDiv.scrollHeight;
  }

}, false);
