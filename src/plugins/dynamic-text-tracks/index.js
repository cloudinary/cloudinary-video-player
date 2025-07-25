// import videojs from 'video.js';
/* eslint-disable */

import languagesList from './languages.json';
import './dynamic-text-tracks.scss';
import { utf8ToBase64 } from '../../utils/utf8Base64';
import { getCloudinaryUrlPrefix } from '../cloudinary/common';
import { parseTranscript } from './parse-transcript';

const dynamicTextTracksPlugin = function () {
  this.player.dynamicTextTracks = new DynamicTextTracks(this);
};

const getTranscriptUrl = (player, languageCode) => {
  const source = player.cloudinary.source();
  const sourcePublicId = source.publicId();
  const sourceDeliveryType = source.resourceConfig().type;
  const urlPrefix = getCloudinaryUrlPrefix(player.cloudinary.cloudinaryConfig());
  return `${urlPrefix}/_applet_/video_service/transcription/${sourceDeliveryType}/${languageCode}/${utf8ToBase64(sourcePublicId)}.transcript`;
};


const DynamicTextTracks = (function () {
  function DynamicTextTracksPlugin(player) {
    this.player = player;
    this.player.one('loadedmetadata', this.initialize.bind(this));
    return this;
  }

  DynamicTextTracksPlugin.prototype.initialize = async function() {
    const player = this;

    const languages = languagesList.map(({ code, name }) => ({
      code,
      label: name,
      status: 'idle',
    }));

    const updateDropdown = () => {
      const dropdown = this.player.controlBar.getChild('SearchableLanguageDropdown');
      if (dropdown) {
        dropdown.updateLanguages(languages);
      }
    };

    const setStatus = (code, status) => {
      console.log('xxx', code, status);
      const lang = languages.find(l => l.code === code);
      if (lang) lang.status = status;
      updateDropdown();
    };

    const addTextTrack = (lang, src, transcriptData) => {
      setStatus(lang.code, 'loaded');
      const captions = parseTranscript(JSON.parse(transcriptData));

      const tracks = this.player.textTracks();
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.kind === 'subtitles') {
          track.mode = 'disabled';
        }
      }

      const captionsTrack = this.player.addRemoteTextTrack({
        kind: 'subtitles',
        label: lang.label,
        srclang: src,
        default: false,
        mode: 'showing',
      });

      captions.forEach(caption => {
        captionsTrack.track.addCue(new VTTCue(caption.startTime, caption.endTime, caption.text));
      });

      languages.forEach(l => {
        l.selected = l.code === lang.code;
      });
    };

    const pollTrackUntilReady = (lang, src, attempt = 0) => {
      fetch(src).then(res => {
        if (res.status === 200) {
          return res.text().then((value) => addTextTrack(lang, src, value)).catch((e) => {});
        } else if (res.status === 202 && attempt < 15) {
          setTimeout(() => pollTrackUntilReady(lang, src, attempt + 1), 2000);
        } else {
          setStatus(lang.code, 'error');
        }
      }).catch(() => {
        setStatus(lang.code, 'error');
      });
    };

    const selectLanguage = (lang) => {
      if (lang.status === 'loaded') {
        const tracks = player.textTracks();
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].mode = (tracks[i].language === lang.code) ? 'showing' : 'disabled';
        }
        return;
      }

      setStatus(lang.code, 'loading');

      const src = getTranscriptUrl(this.player, lang.code);
      pollTrackUntilReady(lang, src);
    };

    this.player.controlBar.addChild('SearchableLanguageDropdown', {
      languages,
      onSelect: selectLanguage,
    });
  };

  return DynamicTextTracksPlugin;
}());

export default dynamicTextTracksPlugin;
