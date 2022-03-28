# cloudinary-video-player

The Cloudinary Video Player is a JavaScript-based HTML5 video player bundled with many valuable customization and integration capabilities, and is monetization and analytics-ready. The player is fully responsive for use in any device or screen size, and is integrated with Cloudinary's video delivery and manipulation solution.

This README includes basic information for installation and getting started. View the [documentation](https://cloudinary.com/documentation/cloudinary_video_player) for comprehensive guidance on integration and all the available features.

## Installation

### NPM
1. Install the files using:

   ```shell
   npm install cloudinary-video-player
   ```
1. Include the javascript file in your HTML. For Example:

   ```html
   <link href="node_modules/cloudinary-video-player/dist/cld-video-player.min.css" rel="stylesheet">
   
   <script src="node_modules/cloudinary-video-player/dist/cld-video-player.min.js" type="text/javascript"></script>
   ```

### CDN

Cloudinary Video Player can also be included directly from the [Unpkg CDN](https://unpkg.com/#/):

```html
<link href="https://unpkg.com/cloudinary-video-player/dist/cld-video-player.min.css" rel="stylesheet">

<script src="https://unpkg.com/cloudinary-video-player/dist/cld-video-player.min.js" type="text/javascript"></script>
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
  id="example-player"
  controls
  autoplay
  data-cld-public-id="dog"
  class="cld-video-player cld-video-player-skin-dark">
</video>
```

Instantiate a new cloudinary Video Player:
```javascript
cloudinary.videoPlayer('example-player', {
   cloud_name: 'demo'
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
1. [Install yarn](https://yarnpkg.com/lang/en/docs/install/)
1. Clone this repository
1. `yarn install`
1. `yarn start`
