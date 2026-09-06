# cloudinary-video-player

Cloudinary Video Player is a JavaScript-based HTML5 video player with HLS/DASH adaptive streaming, chapters, playlists, live streaming, timeline preview, AI highlights graph, multi-language subtitles, Picture-in-Picture, video analytics, and the full Cloudinary Transformations SDK. Fully responsive, 4 kB default bundle.

This README includes basic information for installation and getting started. View the [documentation](https://cloudinary.com/documentation/cloudinary_video_player) for comprehensive guidance on integration and all available features.

## Key Features

- **HLS / DASH adaptive streaming** with ABR quality strategies and auto breakpoints (DPR-aware)
- **Chapters and playlists** with VTT file support and playlist-by-tag
- **Live streaming and VOD** with live-to-VOD archiving
- **Auto format** selection based on browser and device capabilities
- **Auto crop** including AI smart crop via Cloudinary transformations
- **Auto HDR** support
- **Timeline preview** on scrub
- **AI highlights graph** above the seek bar
- **Multi-language subtitles** with pace control and word highlighting
- **Picture-in-Picture (PiP)** support
- **Video analytics** via Cloudinary Media Analytics
- **Saved settings and profiles**
- **All Cloudinary Transformations** available via SDK
- **4 kB** default bundle (light entry point, advanced modules loaded on demand)

## Installation

### Standard vs. Light bundle

| Bundle          | Import                         | Includes                                        |
| --------------- | ------------------------------ | ----------------------------------------------- |
| Light (default) | `cloudinary-video-player`      | Core player, 4 kB, advanced modules lazy-loaded |
| Standard (full) | `cloudinary-video-player/full` | All modules included synchronously              |

Import only what you need:

```js
import 'cloudinary-video-player/adaptive-streaming'; // HLS and DASH
import 'cloudinary-video-player/chapters';
import 'cloudinary-video-player/playlist';
```

Or load everything at once:

```js
import cloudinary from 'cloudinary-video-player/all';
```

### NPM

1. Install using:

   ```shell
   npm install cloudinary-video-player
   ```
2. Import the package:

   ```js
   import cloudinary from 'cloudinary-video-player';
   import 'cloudinary-video-player/player.min.css';
   ```

### CDN

Cloudinary Video Player can also be included directly from the [jsDelivr CDN](https://www.jsdelivr.com/), optional plugins will be lazy-loaded on demand:

```html
<link href="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/player.min.css" rel="stylesheet">

<script src="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/player.min.js" type="text/javascript"></script>
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
cloudinary.player('player', {
   cloudName: 'demo',
   publicId: 'cld-sample-video'
});
```

### Adaptive Bitrate Streaming (HLS / DASH)

```js
import 'cloudinary-video-player/adaptive-streaming';

const player = await cloudinary.player('player', { cloudName: 'demo' });
player.source('my-video', {
  sourceTypes: ['hls'],
  transformation: { streaming_profile: 'hd' }
});
```

For automatic profile selection (no pre-transcoding required):

```js
player.source('my-video', { sourceTypes: ['hls'] });
```

### Live Streaming and VOD

```js
player.source({
  publicId: 'my-live-stream-id',
  type: 'live',
  sourceTypes: ['hls']
});
```

Cloudinary automatically archives live streams as VOD assets once the broadcast ends.

### Chapters

```js
import 'cloudinary-video-player/chapters';

player.source('my-video', {
  chapters: {
    0: 'Introduction',
    30: 'Chapter 2',
    90: 'Conclusion'
  }
});
```

Or use an auto-generated or uploaded VTT file:

```js
player.source('my-video', { chapters: true });
```

### Playlists

```js
import 'cloudinary-video-player/playlist';

player.playlistByTag('highlights', { autoAdvance: true });
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
