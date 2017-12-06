# cloudinary-video-player

## Installation

### NPM
1. Install the files using:

   ```shell
   npm install lodash cloudinary-core cloudinary-video-player
   ```
1. Include the javascript file in your HTML. For Example:

   ```html
   <link href="node_modules/cloudinary-video-player/dist/cld-video-player.min.css" rel="stylesheet">

   <script src="node_modules/lodash/lodash.js" type="text/javascript"></script>
   <script src="node_modules/cloudinary-core/cloudinary-core.js" type="text/javascript"></script>
   <script src="node_modules/cloudinary-video-player/dist/cld-video-player.min.js" type="text/javascript"></script>
   ```

### CDN

Cloudinary Video Player can also be included directly from the [Unpkg CDN](https://unpkg.com/#/):

```html
<link href="https://unpkg.com/cloudinary-video-player/dist/cld-video-player.min.css" rel="stylesheet">

<script src="https://unpkg.com/cloudinary-core/cloudinary-core-shrinkwrap.min.js" type="text/javascript"></script>
<script src="https://unpkg.com/cloudinary-video-player/dist/cld-video-player.min.js" type="text/javascript"></script>
```

### Packages

For your convenience, there are currently 4 variations for our package:
- `cld-video-player.js` - Non minified version which includes all optional modules.
- `cld-video-player.min.js` - Minified version which includes all optional modules.
- `cld-video-player.light.js` - Non minified version which does not include any optional modules.
- `cld-video-player.light.min.js` - Minified version which does not include any optional modules. (for smaller bundle size)

#### Optional modules

- HLS support

### Cloudinary JavaScript library

The Core Cloudinary JavaScript library provides several classes, defined under the "`cloudinary`" domain. The reference documentation is located at https://cloudinary.github.io/pkg-cloudinary-core

#### Getting started

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

Instantiate a new `cloudinary.Cloudinary` instance containing your cloudinary configuration:

```javascript
var cld = cloudinary.Cloudinary.new({ cloud_name: "demo"});
```

Instantiate a new cloudinary Video Player:
```javascript
cld.videoPlayer('example-player')
```

#### Examples
Live demo and examples can be found at CodePen project: https://codepen.io/team/Cloudinary/project/editor/XLYMQV

#### Development
In order to run this project locally:
1. [Install yarn](https://yarnpkg.com/lang/en/docs/install/)
1. Clone this repository
1. `yarn install`
1. `yarn start`
