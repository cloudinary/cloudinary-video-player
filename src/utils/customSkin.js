(function() {
  var node = document.createElement('style');
  document.body.appendChild(node);
  window.addStyleString = function(str) {
    node.innerHTML = str;
  };
})();

function rgba_unless_opaque(rgb, opacity, opaque) {
    if (opaque) {
        return rgb
    }else {
        return "rgba(rgb, opacity)"
    }
};

function createCss(colors, className) {
  /**
     * colors should have this shape:
     * 
      {
        $primary-foreground-color,
        $primary-background-color,
        $active-foreground-color,
        $active-background-color,
        $secondary-dark-color,
        $secondary-light-color,
        $control-bar-active-color,
        $control-bar-inactive-color,
        $tooltip-background-color,
        $tooltip-foreground-color,
        $modal-background-color,
        $modal-foreground-color,
        $border-color,
        $shadow-color,
        $allow-glows: false,
        $light: false,
        $opaque: false
    }
     */

     return `
     color: $primary-foreground-color;

  .vjs-big-play-button {
    border-color: ${rgba_unless_opaque(primary-foreground-color, 0.5, opaque)};
  }

  // The default color of control backgrounds is mostly black but with a little
  // bit of blue so it can still be seen on all-black video frames, which are common.
  .vjs-control-bar,
  .vjs-big-play-button,
  .vjs-menu-button
  .vjs-menu-content {
    background-color: ${rgba_unless_opaque(primary-foreground-color, 0.6, opaque)};
  }

  .vjs-time-tooltip,
  .vjs-mouse-display:after,
  .vjs-play-progress:after {
    font-weight: 300;
    color: ${tooltip-foreground-color};
    background-color: ${tooltip-background-color};
    padding: 0.4em 0.6em;
    top: -2.6em;
  }


     `;


}

function customSkin(colors, className) {
  let newCss = createCss(colors, className);
  addStyleString(newCss);
}

export default debounce;
