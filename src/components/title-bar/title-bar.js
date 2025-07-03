import videojs from 'video.js';
import 'assets/styles/components/title-bar.scss';
import componentUtils from '../component-utils';
import { getCloudinaryUrlPrefix } from 'plugins/cloudinary/common';

// support VJS5 & VJS6 at the same time
const dom = videojs.dom || videojs;

const Component = videojs.getComponent('Component');

class TitleBar extends Component {

  constructor(player, options = {}) {
    super(player, options);

    this.on(player, 'cldsourcechanged', (_, { source }) => this.setItem(source));
  }

  setItem(source) {
    if (!source) {
      this.setTitle('');
      this.setDescription('');
      return;
    }

    const info = source.info();
    this.setTitle(info.title);
    this.setDescription(info.subtitle);

    // auto-fetch title/description if `true`
    const shouldFetchTitle = source.title && source.title() === true;
    const shouldFetchDescription = source.description && source.description() === true;
    
    if (shouldFetchTitle || shouldFetchDescription) {
      this.fetchAutoMetadata(source, shouldFetchTitle, shouldFetchDescription);
    }
  }

  fetchAutoMetadata(source, fetchTitle, fetchDescription) {
    if (source.isRawUrl) return;
    
    const config = source.cloudinaryConfig();
    const publicId = source.publicId();
    
    if (!config?.cloud_name || !publicId) return;
    
    const urlPrefix = getCloudinaryUrlPrefix(config);
    const metadataUrl = `${urlPrefix}/_applet_/video_service/video_metadata/upload/${publicId}.json`;
    
    fetch(metadataUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(metadata => {
        if (fetchTitle && metadata.title) {
          this.setTitle(metadata.title);
        }
        if (fetchDescription && metadata.description) {
          this.setDescription(metadata.description);
        }
      })
      .catch(error => {
        console.warn(`Failed to fetch metadata for ${publicId}:`, error);
      });
  }

  setTitle(text) {
    const displayText = typeof text === 'string' ? text : '';
    componentUtils.setText(this.titleEl, displayText);
    this.refresh();
    return displayText;
  }

  setDescription(text) {
    const displayText = typeof text === 'string' ? text : '';
    componentUtils.setText(this.descriptionEl, displayText);
    this.refresh();
    return displayText;
  }

  refresh() {
    const titleValue = () => this.titleEl.innerText;
    const descriptionValue = () => this.descriptionEl.innerText;

    if (!titleValue() && !descriptionValue()) {
      this.hide();
      return;
    }

    this.show();
  }

  createEl() {
    this.titleEl = dom.createEl('div', {
      className: 'vjs-title-bar-title'
    });

    this.descriptionEl = dom.createEl('div', {
      className: 'vjs-title-bar-subtitle'
    });

    const el = super.createEl('div', {
      append: this.titleEl,
      className: 'vjs-title-bar'
    });

    el.appendChild(this.titleEl);
    el.appendChild(this.descriptionEl);

    return el;
  }
}

videojs.registerComponent('titleBar', TitleBar);

export default TitleBar;
