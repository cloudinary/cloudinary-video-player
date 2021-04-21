window.addEventListener('load', function () {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo', secure: true });

  var player = cld.videoPlayer('player');

  player.source('https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_2MB.mp4');

  var adpPlayer = cld.videoPlayer('adpPlayer');

  adpPlayer.source('https://res.cloudinary.com/demo/video/upload/sp_hd/sea_turtle.mpd');
}, false);
