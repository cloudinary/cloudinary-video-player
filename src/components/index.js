import videojs from 'video.js';
import CldErrorDisplay from './error-display/error-display';
import JumpForwardButton from './jumpButtons/jump-10-plus';
import JumpBackButton from './jumpButtons/jump-10-minus';
import LogoButton from './logoButton/logo-button';
import ProgressControlEventsBlocker from './progress-control-events-blocker/progress-control-events-blocker';
import TitleBar from './title-bar/title-bar';
import SourceSwitcherButton from './source-switcher-button/source-switcher-button';
import BigPauseButton from './bigPauseButton/big-pause-button';

videojs.registerComponent('ErrorDisplay', CldErrorDisplay);

export {
  CldErrorDisplay,
  JumpForwardButton,
  JumpBackButton,
  LogoButton,
  ProgressControlEventsBlocker,
  TitleBar,
  SourceSwitcherButton,
  BigPauseButton
};
