window.addEventListener('load', function () {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var player = cld.videoPlayer('player');

  var source = {
    info: {
      title: 'Shoppable Video',
      description: 'Browse products shown in the video.'
    },
    shoppable: {
      startState: 'openOnPlay',
      autoClose: 2,
      showPostPlayOverlay: true,
      bannerMsg: 'START SHOPPING',
      width: '20%',
      toggleIcon: 'https://res.cloudinary.com/cloudinary/image/upload/c_scale,w_200/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.png',
      transformation: {
        crop: 'fill',
        aspect_ratio: '1'
      },
      products: [
        {
          productId: 1,
          productName: 'Bell Pepper',
          startTime: 0,
          endTime: 2,
          title: 'Overlay on-hover & seek on-click',
          publicId: 'docs/pepper',
          hotspots: [
            {
              time: '00:02',
              x: '80%',
              y: '30%',
              tooltipPosition: 'bottom',
              clickUrl: 'https://www.example.net/product-one'
            }
          ],
          onHover: {
            action: 'overlay',
            args: 'Click to see this product in the video'
          },
          onClick: {
            action: 'seek',
            pause: 5,
            args: {
              time: '00:02'
            }
          }
        },
        {
          productId: 2,
          productName: 'Tomato',
          startTime: 2,
          endTime: 5,
          publicId: 'docs/tomatoes',
          onHover: {
            action: 'switch',
            args: {
              publicId: 'docs/tomatoes_alternate'
            }
          },
          onClick: {
            action: 'goto',
            pause: true,
            args: {
              url: 'https://www.example.net/product-two'
            }
          }
        },
        {
          productId: 3,
          productName: 'Banana',
          startTime: 7,
          endTime: 11,
          publicId:
                        'docs/banana',
          onHover: {
            action: 'switch',
            args: {
              publicId: 'docs/banana_alternate'
            }
          },
          onClick: {
            action: 'goto',
            pause: true,
            args: {
              url: 'https://www.example.net/product-three'
            }
          }
        },
        {
          productName: 'Product 4',
          productId: 4,
          publicId: 'balloons'
        },
        {
          productName: 'Product 5',
          productId: 5,
          publicId: 'friends'
        }
      ]
    }
  };

  player.source('snow_horses', source);

  // Player Events
  player.on('productHover', function (e, data) {
    console.log('Product Hover: ' + JSON.stringify(data));
  });

  player.on('productClick', function (e, data) {
    console.log('Product Click: ' + JSON.stringify(data));
  });

  player.on('productBarMin', function () {
    console.log('Product bar close');
  });

  player.on('productBarMax', function () {
    console.log('Product bar open');
  });

  player.on('replay', function () {
    console.log('replay');
  });

  player.on('productHoverPost', function (e, data) {
    console.log('Product Hover Post Playback: ' + JSON.stringify(data));
  });

  player.on('productClickPost', function (e, data) {
    console.log('Product Click Post Playback: ' + JSON.stringify(data));
  });

}, false);
