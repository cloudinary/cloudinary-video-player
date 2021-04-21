window.addEventListener('load', function () {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo', secure: true });
  var uap = new window.UAParser(navigator.userAgent);
  var playerHls = cld.videoPlayer('example-player-hls');

  var playerHlsH265 = cld.videoPlayer('example-player-hls-h265');
  var playerDash = cld.videoPlayer('example-player-dash');
  var playerDashVp9 = cld.videoPlayer('example-player-dash-vp9');
  var playerHlsNoCodec = cld.videoPlayer('example-player-hls-no-codec');
  var playerDashNoCodec = cld.videoPlayer('example-player-dash-no-codec');
  var playerHlsIos = cld.videoPlayer('example-player-hls-ios', {
    html5: {
      hls: {
        overrideNative: true
      }
    }
  });

  playerHls.source(
    'sea_turtle',
    {
      sourceTypes: ['hls'],
      transformation: { streaming_profile: 'hd' },
      info: { title: 'HLS' }
    }
  );

  playerHlsH265.source(
    'sea_turtle',
    {
      sourceTypes: ['hls/h265'],
      transformation: { streaming_profile: 'h265_full_hd' },
      info: { title: 'HLS 265' }
    }
  );

  playerDash.source(
    'sea_turtle',
    {
      sourceTypes: ['dash/h264'],
      transformation: { streaming_profile: 'hd' },
      info: { title: 'MPEG-DASH' }
    }
  );

  playerDashVp9.source(
    'sea_turtle',
    {
      sourceTypes: ['dash/vp9'],
      transformation: { streaming_profile: 'vp9_full_hd' },
      info: { title: 'MPEG-DASH vp9' }
    }
  );

  playerHlsNoCodec.source(
    'sea_turtle',
    {
      sourceTypes: ['hls'],
      info: { title: 'HLS' }
    }
  );

  playerDashNoCodec.source(
    'sea_turtle',
    {
      sourceTypes: ['dash'],
      info: { title: 'MPEG-DASH' }
    }
  );

  playerHlsIos.source(
    'sea_turtle',
    {
      sourceTypes: ['hls'],
      transformation: { streaming_profile: 'hd' },
      info: { title: 'HLS' }
    }
  );


  var browserName = uap.getBrowser().name + ' is playing';

  playerHls.on('qualitychanged', function(data) {
    console.log('HLS player', data);
  });

  playerHls.videojs.on('playing', function() {
    document.getElementById('info-hls').innerText = browserName + playerHls.videojs.currentSrc();
  });

  playerHls.on('error', function() {
    console.log(playerHls.videojs.error());
  });

  playerHlsH265.videojs.on('playing', function() {
    document.getElementById('info-hls-h265').innerText = browserName + playerHlsH265.videojs.currentSrc();
  });

  playerDash.on('qualitychanged', function(data) {
    console.log('Dash player', data);
  });

  playerDash.videojs.on('playing', function() {
    document.getElementById('info-dash').innerText = browserName + playerDash.videojs.currentSrc();
  });

  playerDashVp9.videojs.on('playing', function() {
    document.getElementById('info-dash-vp9').innerText = browserName + playerDashVp9.videojs.currentSrc();
  });

  playerHlsNoCodec.videojs.on('playing', function() {
    document.getElementById('info-hls-no-codec').innerText = browserName + playerHlsNoCodec.videojs.currentSrc();
  });

  playerDashNoCodec.videojs.on('playing', function() {
    document.getElementById('info-dash-no-codec').innerText = browserName + playerDashNoCodec.videojs.currentSrc();
  });

}, false);
