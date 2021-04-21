window.addEventListener('load', function() {

  var tt = {
    surf_competition: {
      captions: {
        label: 'English captions',
        language: 'en',
        default: true,
        url: 'https://res.cloudinary.com/yaronr/raw/upload/v1558965984/Meetup_english.vtt'
      },
      subtitles: [
        {
          label: 'German subtitles',
          language: 'de',
          url: 'https://res.cloudinary.com/yaronr/raw/upload/v1558966008/Meetup_german.vtt'
        },
        {
          label: 'Russian subtitles',
          language: 'ru',
          url: 'https://res.cloudinary.com/yaronr/raw/upload/v1558966053/Meetup_russian.vtt'
        }
      ]
    },
    finish_line: {
      captions: {
        label: 'English captions',
        language: 'en',
        default: true,
        url: 'https://res.cloudinary.com/demo/raw/upload/outdoors.vtt'
      }
    },
    dirt_bike: {
      captions: {
        label: 'English captions',
        language: 'en',
        default: true,
        url:
                    'https://res.cloudinary.com/yaronr/raw/upload/v1558966053/Meetup_russian.vtt'
      }
    }
  };

  function getTT(res) {
    return { textTracks: tt[res.publicId] || tt.dirt_bike };
  }

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var player = cld.videoPlayer('player', {});

  var sorter = function(a, b) {
    if (a.publicId < b.publicId) {
      return 1;
    }
    if (a.publicId > b.publicId) {
      return -1;
    }
    return 0;
  };

  // Fetch playlist by tag. Since this operation involves an API call
  // the function returns a Promise when the operation completes.
  // The return value is 'player'.
  player.playlistByTag('video_race', {
    sorter: sorter,
    autoAdvance: true,
    repeat: true,
    presentUpcoming: false,
    sourceParams: getTT
  }).then(function(player) {
    var divElem = document.querySelector('div#playlist-data');
    var list = player.playlist().list().map(function(source) {
      return source.publicId();
    }).join(', ');

    divElem.innerText = 'Playlist: ' + list;
  });

}, false);
