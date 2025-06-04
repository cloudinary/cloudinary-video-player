# cloudinary-video-player

Cloudinary Video Player is a JavaScript-based HTML video player bundled with many valuable customization and integration capabilities, and is monetization and analytics-ready. The player is fully responsive for use in any device or screen size, and is integrated with Cloudinary's video delivery and manipulation solution.

This README includes basic information for installation and getting started. View the [documentation](https://cloudinary.com/documentation/cloudinary_video_player) for comprehensive guidance on integration and all the available features.

## Installation

### NPM
1. Install using:

   ```shell
   npm install cloudinary-video-player
   ```
2. Import the package:

   ```js
   import cloudinary from 'cloudinary-video-player';
   import 'cloudinary-video-player/cld-video-player.min.css';
   // import required plugins like that:
   // import 'cloudinary-video-player/chapters';
   // import 'cloudinary-video-player/playlist';
   ```

* Note - import `/all` to get all available plugins in a single import:

   ```js
   import cloudinary from 'cloudinary-video-player/all';
   import 'cloudinary-video-player/cld-video-player.min.css';
   ```

### CDN

Cloudinary Video Player can also be included directly from the [jsDelivr CDN](https://www.jsdelivr.com/), optional plugins will be lazy-loaded on demand:

```html
<link href="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/cld-video-player.min.css" rel="stylesheet">

<script src="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/cld-video-player.min.js" type="text/javascript"></script>
```


## Getting started

Create a video tag containing `cld-video-player` class and a supported skin class:
```html
<video
  id="player"
  controls
  autoplay
  data-cld-public-id="dog"
  class="cld-video-player cld-fluid">
</video>
```

Instantiate a new cloudinary Video Player:
```javascript
cloudinary.videoPlayer('player', {
   cloudName: 'demo',
   publicId: 'cld-sample-video'
});
```

## Documentation
- [Documentation](https://cloudinary.com/documentation/cloudinary_video_player)
- [API Reference](https://cloudinary.com/documentation/video_player_api_reference)
- [Demos](https://cloudinary.com/demos?filter=videos)
- [Code Examples](https://cloudinary.github.io/cloudinary-video-player/)
- [Video Player Studio](https://studio.cloudinary.com/) 

## Development
In order to run this project locally:
1. Clone this repository
1. `npm install`
1. `npm start`
