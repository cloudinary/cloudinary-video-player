window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpreonly&cmsid=496&vid=short_onecue&correlator=';

  var player = cld.videoPlayer('player', {
    ads: {
      adTagUrl: adTagUrl
    }
  });

  var sorter = function(a, b) {
    if (a.publicId < b.publicId) {
      return 1;
    }
    if (a.publicId > b.publicId) {
      return -1;
    }
    return 0;
  };

  player.playlistByTag('video_race', {
    sorter: sorter,
    autoAdvance: 5,
    repeat: true,
    presentUpcoming: false
  }).then(function(player) {
    var divElem = document.querySelector('div#playlist-data');
    var list = player.playlist().list().map(function(source) {
      return source.publicId();
    }).join(', ');

    divElem.innerText = 'Playlist: ' + list;
  });

}, false);
