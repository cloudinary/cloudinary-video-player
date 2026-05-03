import videojs from 'video.js';
import { PLAYER_EVENT } from '~/utils/consts';

const ErrorDisplay = videojs.getComponent('ErrorDisplay');

class CldErrorDisplay extends ErrorDisplay {
  content() {
    const error = this.player().error();
    if (!error) return '';

    const wrapper = videojs.dom.createEl('div', { className: 'cld-error-display-content' });
    const header = videojs.dom.createEl('div', { className: 'cld-error-header' });
    const title = videojs.dom.createEl('span', { className: 'cld-error-title' }, {}, this.localize('Something went wrong'));
    const msg = videojs.dom.createEl('div', { className: 'cld-error-message' });

    header.appendChild(title);

    if (error.isHtml) {
      msg.innerHTML = this.localize(error.message);
    } else {
      msg.textContent = this.localize(error.message);
    }
    wrapper.appendChild(header);
    wrapper.appendChild(msg);

    const refreshLink = msg.querySelector('.cld-error-refresh');
    if (refreshLink) {
      refreshLink.onclick = (e) => {
        e.preventDefault();
        this.player().trigger(PLAYER_EVENT.REFRESH);
      };
    } else {
      const retryButton = videojs.dom.createEl('button', {
        className: 'cld-error-refresh',
        type: 'button'
      }, {}, this.localize('Try Again'));

      retryButton.onclick = () => {
        this.player().trigger(PLAYER_EVENT.REFRESH);
      };

      wrapper.appendChild(retryButton);
    }
    return wrapper;
  }
}

export default CldErrorDisplay;
