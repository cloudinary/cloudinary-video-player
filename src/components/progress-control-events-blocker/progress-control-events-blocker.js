import videojs from 'video.js';
const Component = videojs.getComponent('Component');

class ProgressControlEventsBlocker extends Component {

  constructor(player, options = {}) {
    super(player, options);
  }

  createEl() {
    return super.createEl('div', {
      className: 'vjs-progress-control-events-blocker'
    });
  }
}

videojs.registerComponent('progressControlEventsBlocker', ProgressControlEventsBlocker);
