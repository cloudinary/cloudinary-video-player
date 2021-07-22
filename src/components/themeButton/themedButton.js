import { elementsCreator } from '../../utils/dom';


export const themedButton = ({ text, onClick, theme = '', loadingDelay = 0 }) => {
  return elementsCreator({
    tag: 'button',
    attr: { class: `vp-theme-button theme-${theme}` },
    onClick,
    children: [
      {
        tag: 'div',
        attr: { class: 'vp-loading-bar' },
        style: {
          'animation-duration': `${loadingDelay}ms`
        }
      },
      {
        tag: 'div',
        attr: { class: 'content' },
        children: text
      }
    ]
  });
};

