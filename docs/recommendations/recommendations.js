// needed for tests
var player = null;

window.addEventListener('load', function() {

  var cld = window.cloudinary.Cloudinary.new({ cloud_name: 'demo' });

  var source1 = {
    publicId: 'surf_competition',
    info: {
      title: 'Surf competition',
      subtitle: 'A movie about a surf competition',
      description: 'A description of the surf competition movie'
    }
  };

  var source2 = {
    publicId: 'finish_line',
    info: {
      title: 'Finish line',
      subtitle: 'A short video of a finish line',
      description: 'A description of the finish line movie.'
    }
  };

  // Recommendations can be as simple as an array of other video source objects
  source1.recommendations = [source2];

  // For async fetching of recommendations (e.g. fetching from database), promises can be used
  source2.recommendations = new Promise(function (resolve, _) {
    console.log('Going to database...');
    setTimeout(function() {
      console.log('Fetched source from database.', source1);
      resolve([source1]);
    }, 3000);
  });

  player = cld.videoPlayer('player', { autoShowRecommendations: true });

  player.source(source1);

}, false);
