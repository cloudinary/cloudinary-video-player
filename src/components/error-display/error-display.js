import videojs from 'video.js';
import { PLAYER_EVENT } from 'utils/consts';

const ErrorDisplay = videojs.getComponent('ErrorDisplay');

class CldErrorDisplay extends ErrorDisplay {
  content() {
    const error = this.player().error();
    if (!error) return '';

    const wrapper = videojs.dom.createEl('div', { className: 'cld-error-display-content' });
    const msg = videojs.dom.createEl('span', { className: 'cld-error-message' });
    msg.innerHTML = this.localize(error.message);
    wrapper.appendChild(msg);

    const refreshLink = msg.querySelector('.cld-error-refresh');
    if (refreshLink) {
      refreshLink.onclick = (e) => {
        e.preventDefault();
        this.player().trigger(PLAYER_EVENT.REFRESH);
      };
    }
    return wrapper;
  }
}

export default CldErrorDisplay;
