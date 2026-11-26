// S-2 fixture: one own control-bar control, built only on documented public APIs
// (UIElement + PlayerController + a feature selector; see docs/guides/build-your-own-component.md).
// It reflects player state (data-paused) and announces activation with an event; v5 would open the
// Cloudinary link there. The overlay needs no script: it is markup plus own-ui.css.
import { PlayerController, UIElement, playerContext, selectPlayback } from '@videojs/html';

class CldLogoButtonElement extends UIElement {
  #playback = new PlayerController(this, playerContext, selectPlayback);
  #disconnect = null;
  updates = 0;

  connectedCallback() {
    super.connectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = new AbortController();
    const { signal } = this.#disconnect;

    this.setAttribute('role', 'button');
    this.setAttribute('aria-label', 'Cloudinary');
    this.setAttribute('tabindex', '0');
    this.addEventListener('click', this.#activate, { signal });
    this.addEventListener('keydown', this.#keydown, { signal });
    this.addEventListener('keyup', this.#keyup, { signal });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }

  update(changed) {
    super.update(changed);
    this.updates += 1;
    const playback = this.#playback.value;
    // Features are configured per player, so the selector can return undefined.
    if (!playback) return;
    this.toggleAttribute('data-ready', true);
    this.toggleAttribute('data-paused', playback.paused);
  }

  #activate = () => {
    this.dispatchEvent(new CustomEvent('cld-logo-activate', { bubbles: true, composed: true }));
  };

  #keydown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.#activate();
    } else if (event.key === ' ') {
      event.preventDefault();
    }
  };

  // ARIA button pattern: Space activates on keyup.
  #keyup = (event) => {
    if (event.key === ' ') this.#activate();
  };
}

customElements.define('cld-logo-button', CldLogoButtonElement);
