/* eslint-disable  */
import videojs from 'video.js';
import './dynamic-text-tracks-button.scss';

const Component = videojs.getComponent('Component');

class SearchableLanguageDropdown extends Component {
  constructor(player, options = {}) {
    super(player, options);

    this.player = player;
    this.languages = options.languages || [];
    this.onSelect = options.onSelect || (() => {});
    this.open = false;
    this.dropdownEl = null;

    this.el().addEventListener('click', (e) => this.handleToggle(e));
  }

  createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-searchable-language-dropdown vjs-control vjs-button vjs-icon-placeholder',
      innerHTML: `
        <button class="vjs-lang-toggle" aria-label="Select Language" title="Select Language"></button>
      `
    });
  }

  handleToggle(e) {
    const isToggle = e.target.classList.contains('vjs-lang-toggle');
    if (isToggle) {
      this.open ? this.hideDropdown() : this.showDropdown();
      e.stopPropagation();
    }
  }

  createDropdown() {
    this.dropdownEl = document.createElement('div');
    this.dropdownEl.className = 'vjs-lang-popover';
    this.dropdownEl.innerHTML = `
      <input type="text" placeholder="Search..." class="vjs-lang-search">
      <div class="vjs-lang-header">Languages</div>
      <ul class="vjs-lang-list"></ul>
    `;
    const container = this.player.el_ || document.body;
    container.appendChild(this.dropdownEl);
  }

  showDropdown() {
    if (!this.dropdownEl) this.createDropdown();

    this.open = true;
    this.dropdownEl.style.position = 'absolute';
    this.dropdownEl.style.right = 0;
    this.dropdownEl.style.bottom = '43px';
    this.dropdownEl.style.zIndex = 9999;
    this.dropdownEl.style.display = 'block';

    const input = this.dropdownEl.querySelector('.vjs-lang-search');
    input.value = '';
    input.focus();
    input.addEventListener('input', () => {
      this.renderList(input.value.toLowerCase());
    });

    this.renderList('');
  }

  hideDropdown() {
    this.open = false;
    if (this.dropdownEl) {
      this.dropdownEl.style.display = 'none';
    }
  }

  renderList(query = '') {
    const ul = this.dropdownEl.querySelector('.vjs-lang-list');
    ul.innerHTML = '';

    const filtered = this.languages.filter(l =>
      l.label.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      const li = document.createElement('li');
      li.className = 'vjs-lang-empty';
      li.textContent = 'No results...';
      ul.appendChild(li);
      return;
    }

    filtered.forEach(lang => {
      const status = lang.status || 'idle';
      const icon = {
        idle: '',
        loading: '⏳',
        loaded: '✅',
        error: '❌'
      }[status] || '';

      const li = document.createElement('li');
      li.className = `vjs-lang-item vjs-lang-${status}`;
      li.innerHTML = `
        <span>${lang.label}</span>
        <span class="vjs-lang-icon">${icon}</span>
      `;

      if (lang.selected) {
        li.classList.add('vjs-lang-selected');
      }

      li.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onSelect(lang);
        // Keep dropdown open
      });

      ul.appendChild(li);
    });
  }

  updateLanguages(languages) {
    this.languages = languages;
    if (this.open) {
      const q = this.dropdownEl.querySelector('.vjs-lang-search').value.toLowerCase();
      this.renderList(q);
    }
  }
}

videojs.registerComponent('SearchableLanguageDropdown', SearchableLanguageDropdown);
export default SearchableLanguageDropdown;
