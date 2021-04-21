window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'yaronr' });

  var player = cld.videoPlayer('player');

  player.source(
    'stubhub',
    {
      textTracks: {
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
          }, {
            label: 'Hebrew subtitles',
            language: 'he',
            url: 'https://res.cloudinary.com/yaronr/raw/upload/v1558966053/Meetup_heb.vtt.mv'
          }
        ]
      }
    }
  );

  // Playlist
  var playlist = cld.videoPlayer('playlist');

  var source1 = {
    publicId: 'stubhub',
    info: { title: 'Subtitles & Captions playlist' },
    textTracks: {
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
    }
  };
  var source2 = {
    publicId: 'outdoors',
    info: { title: 'Outdoors', subtitle: 'Outdoors movie with captions' },
    textTracks: {
      captions: {
        label: 'English captions',
        language: 'en',
        default: true,
        url: 'https://res.cloudinary.com/demo/raw/upload/outdoors.vtt'
      }
    }
  };
  var source3 = {
    publicId: 'dog',
    info: { title: 'Dog', subtitle: 'Video of a dog, no captions' }
  };

  var playlistSources = [source1, source2, source3];
  var playlistOptions = {
    autoAdvance: true,
    repeat: true,
    presentUpcoming: 8
  };
  playlist.playlist(playlistSources, playlistOptions);

}, false);
