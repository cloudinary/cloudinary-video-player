window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'canada-goose', secure: true });

  cld.videoPlayer('jordin-video-en', {
    publicId: 'videos/parkas/CG_FW19LITO_PARKAS_HERO_1920x1080_English',
    fluid: true,
    loop: false,
    controls: true,
    autoplayMode: 'never',
    crop: 'fill',
    sourceTypes: ['mp4'],
    videojs: {
      bigPlayButton: true,
      loadingSpinner: true
    }
  });

  cld.videoPlayer('hero-womens', {
    publicId: 'videos/parkas/CG_FW19_Parkas_Aldridge_960x718',
    fluid: true,
    loop: true,
    controls: false,
    autoplayMode: 'always',
    crop: 'fill',
    sourceTypes: ['webm'],
    videojs: {
      bigPlayButton: false,
      loadingSpinner: false
    }
  });

  cld.videoPlayer('hero-mens', {
    publicId: 'videos/parkas/CG_FW19_Parkas_Erickson_960x718',
    fluid: true,
    loop: true,
    controls: false,
    autoplayMode: 'webm',
    crop: 'fill',
    sourceTypes: ['mp4'],
    videojs: {
      bigPlayButton: false,
      loadingSpinner: false
    }
  });

}, false);
