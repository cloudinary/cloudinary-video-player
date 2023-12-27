# cloudinary-video-player

Cloudinary Video Player is a JavaScript-based HTML video player bundled with many valuable customization and integration capabilities, and is monetization and analytics-ready. The player is fully responsive for use in any device or screen size, and is integrated with Cloudinary's video delivery and manipulation solution.

This README includes basic information for installation and getting started. View the [documentation](https://cloudinary.com/documentation/cloudinary_video_player) for comprehensive guidance on integration and all the available features.

## Installation

### NPM
1. Install using:

   ```shell
   npm install cloudinary-video-player
   ```
1. Import the package:

   ```js
   import cloudinary from 'cloudinary-video-player';
   // Also possible:
   // import { videoPlayer } from 'cloudinary-video-player';
   import 'cloudinary-video-player/cld-video-player.min.css';
   ```

### CDN

Cloudinary Video Player can also be included directly from the [jsDelivr CDN](https://www.jsdelivr.com/):

```html
<link href="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/cld-video-player.min.css" rel="stylesheet">

<script src="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/cld-video-player.min.js" type="text/javascript"></script>
```

### Packages

The Cloudinary video player offers standard and light package variations, available in either minified or non-minified formats.
* Standard package: Includes all functionality described in this video player [documentation](https://cloudinary.com/documentation/cloudinary_video_player).  
* Light package: Excludes the following optional functionality: Adaptive bitrate streaming (HLS and MPEG-DASH), Video ads, Shoppable videos (alpha)  

- `cld-video-player.js` - Non minified version which includes all optional modules.
- `cld-video-player.min.js` - Minified version which includes all optional modules.
- `cld-video-player.light.js` - Non minified version which does not include any optional modules.
- `cld-video-player.light.min.js` - Minified version which does not include any optional modules. (for smaller bundle size)


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
   cloudName: 'demo'
});
```

## Documentation
- [Documentation](https://cloudinary.com/documentation/cloudinary_video_player)
- [API Reference](https://cloudinary.com/documentation/video_player_api_reference)
- [Demo](https://demo.cloudinary.com/video-player/)
- [Code Examples](https://cloudinary.github.io/cloudinary-video-player/)
- [Video Player Studio](https://studio.cloudinary.com/) 

## Development
In order to run this project locally:
1. Clone this repository
1. `npm install`
1. `npm start`
