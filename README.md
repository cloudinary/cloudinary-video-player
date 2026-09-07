# Cloudinary Video Player

[![npm version](https://img.shields.io/npm/v/cloudinary-video-player.svg)](https://www.npmjs.com/package/cloudinary-video-player)
[![license](https://img.shields.io/npm/l/cloudinary-video-player.svg)](https://www.npmjs.com/package/cloudinary-video-player)
[![CI](https://github.com/cloudinary/cloudinary-video-player/actions/workflows/validate.yml/badge.svg)](https://github.com/cloudinary/cloudinary-video-player/actions/workflows/validate.yml)

Cloudinary Video Player is an HTML5 video player, built on [Video.js](https://videojs.com/), for delivering and customizing Cloudinary-hosted video in the browser. The package is `cloudinary-video-player`; it runs in modern browsers and ships as both a UMD bundle for `<script>`/CDN use and a tree-shakeable ESM build for bundlers. The current release is 4.x.

## Installation

Install from npm and import the player with its stylesheet:

```bash
npm install cloudinary-video-player
```

```js
import cloudinary from 'cloudinary-video-player';
import 'cloudinary-video-player/player.min.css';
```

Or include the UMD build directly from the jsDelivr CDN, which exposes a global `cloudinary` object. Optional plugins are lazy-loaded on demand:

```html
<link href="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/player.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/player.min.js" type="text/javascript"></script>
```

## Configuration

This is a browser-side player. It plays assets that already live in a Cloudinary product environment, so it takes only the public `cloudName` — never the API key or API secret. Pass the cloud name when you instantiate a player:

```js
import cloudinary from 'cloudinary-video-player';
import 'cloudinary-video-player/player.min.css';

const player = cloudinary.videoPlayer('player', {
  cloudName: 'my_cloud_name',
});
```

`cloudName` is the only required Cloudinary setting. Other init options such as `secure` (HTTPS delivery, on by default) and `cname` (custom delivery hostname) map to Cloudinary delivery config. Because no secret is involved, all configuration is safe to ship in client-side code. Uploading assets and generating signed URLs happen server-side with a different SDK (see [For AI agents](#for-ai-agents)).

## Quick examples

The examples use the `demo` cloud and its sample videos so they run as-is. Replace `demo` with your own cloud name and use your own public IDs.

### Play a Cloudinary video

Create a `<video>` element with the `cld-video-player` class (add `cld-fluid` for a responsive layout), then instantiate the player with `cloudinary.videoPlayer(elementId, options)`, pointing it at a `cloudName` and the `publicId` of the video to play:

```html
<link href="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/player.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/player.min.js" type="text/javascript"></script>

<video id="player" controls class="cld-video-player cld-fluid"></video>

<script>
  cloudinary.videoPlayer('player', {
    cloudName: 'demo',
    publicId: 'cld-sample-video',
  });
</script>
```

### Apply a video transformation

`player.source(publicId, options)` sets the playing video and accepts a `transformation` object using Cloudinary's transformation parameters. This resizes to a 500x500 fill crop and lets Cloudinary pick the quality for the requesting browser:

```js
import cloudinary from 'cloudinary-video-player';
import 'cloudinary-video-player/player.min.css';

const player = cloudinary.videoPlayer('player', { cloudName: 'demo' });

player.source('cld-sample-video', {
  transformation: { width: 500, height: 500, crop: 'fill', quality: 'auto' },
});
// Delivered from https://res.cloudinary.com/demo/video/upload/c_fill,h_500,q_auto,w_500/cld-sample-video
```

### Play a playlist of videos

`player.playlist(sources)` takes an array of public IDs and plays them in sequence, with a scrollable playlist widget. Each entry is a public ID string or a source object:

```js
import cloudinary from 'cloudinary-video-player';
import 'cloudinary-video-player/player.min.css';

const player = cloudinary.videoPlayer('player', { cloudName: 'demo' });

player.playlist(['cld-sample-video', 'dog', 'elephants']);
```

## For AI agents

`cloudinary-video-player` is the browser-side HTML5 video player for Cloudinary-hosted video, built on Video.js; initialize it with `cloudinary.videoPlayer(elementId, { cloudName, publicId })`. For tasks this package doesn't cover, choose a different package:

| Task | Package |
|---|---|
| Track video analytics on any player (also ships inside this one) | [`cloudinary-video-analytics`](https://github.com/cloudinary/cloudinary-video-analytics) |
| Use the default player profiles/presets standalone | [`cloudinary-video-player-profiles`](https://github.com/cloudinary/cloudinary-video-player-profiles) |
| Build delivery URLs in the browser without a player UI | [`@cloudinary/url-gen`](https://github.com/cloudinary/js-url-gen) |
| Render React, Angular, or Vue components | [`@cloudinary/react` / `@cloudinary/ng` / `@cloudinary/vue`](https://github.com/cloudinary/frontend-frameworks) |
| Upload, sign URLs, or call the Admin API server-side | [`cloudinary`](https://github.com/cloudinary/cloudinary_npm) |
| Run Cloudinary operations as agent tools | [Cloudinary MCP servers](https://github.com/cloudinary/mcp-servers) |

## Links

- [Video Player guide](https://cloudinary.com/documentation/cloudinary_video_player)
- [API reference](https://cloudinary.com/documentation/video_player_api_reference)
- [Code examples](https://cloudinary.github.io/cloudinary-video-player/)
- [Video Player Studio](https://studio.cloudinary.com/) — configure a player visually and copy the code
- [Documentation llms.txt index](https://cloudinary.com/documentation/llms.txt)
- [Package on npm](https://www.npmjs.com/package/cloudinary-video-player)

Released under the MIT license.
