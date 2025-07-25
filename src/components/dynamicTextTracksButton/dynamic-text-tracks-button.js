/* eslint-disable  */
import videojs from 'video.js';

const Component = videojs.getComponent('Component');

class SearchableLanguageDropdown extends Component {
  constructor(player, options = {}) {
    super(player, options);

    this.languages = options.languages || [];
    this.onSelect = options.onSelect || (() => {});
    this.open = false;

    this.el().addEventListener('click', (e) => this.handleToggle(e));
    document.addEventListener('click', (e) => {
      if (!this.el().contains(e.target)) this.hideDropdown();
    });
  }

  createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-searchable-language-dropdown vjs-control vjs-button',
      innerHTML: `
      <button class="vjs-lang-toggle" aria-label="Select Language" title="Select Language">
        🌐
      </button>
      <div class="vjs-lang-popover hidden">
        <input type="text" placeholder="Search..." class="vjs-lang-search">
        <div class="vjs-lang-header">Languages</div>
        <ul class="vjs-lang-list"></ul>
      </div>
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

  showDropdown() {
    this.open = true;
    const popover = this.el().querySelector('.vjs-lang-popover');
    popover.classList.remove('hidden');

    const input = popover.querySelector('.vjs-lang-search');
    input.value = '';
    input.focus();
    input.addEventListener('input', () => {
      this.renderList(input.value.toLowerCase());
    });

    this.renderList('');
  }

  hideDropdown() {
    this.open = false;
    this.el().querySelector('.vjs-lang-popover').classList.add('hidden');
  }

  renderList(query = '') {
    const ul = this.el().querySelector('.vjs-lang-list');
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
      const iconMap = {
        idle: '',
        loading: '⏳',
        loaded: '✅',
        error: '❌'
      };
      const icon = iconMap[lang.status || 'idle'] || '';
      const li = document.createElement('li');
      li.className = `vjs-lang-item vjs-lang-${lang.status || 'idle'} ${lang.selected ? 'vjs-lang-selected' : ''}`;
      li.innerHTML = `<span>${lang.label}</span><span class="vjs-lang-icon">${icon}</span>`;
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onSelect(lang);
      });
      ul.appendChild(li);
    });
  }

  updateLanguages(languages) {
    this.languages = languages;
    if (this.open) {
      const q = this.el().querySelector('.vjs-lang-search').value.toLowerCase();
      this.renderList(q);
    }
  }
}

videojs.registerComponent('SearchableLanguageDropdown', SearchableLanguageDropdown);
export default SearchableLanguageDropdown;
