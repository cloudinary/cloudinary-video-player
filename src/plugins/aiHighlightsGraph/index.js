import videojs from 'video.js';

import './aiHighlightsGraph.scss';

// Default options for the plugin.
let defaults = {};

/**
 * Function to invoke when the player is ready.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = function onPlayerReady(player, options) {
  player.addClass('vjs-ai-highlights-graph');
  player.aiHighlightsGraph = new HighlightsGraphPlugin(player, options);
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function aiHighlightsGraph
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
function aiHighlightsGraph(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
}

/**
 * HighlightsGraphPlugin class.
 *
 * This class performs all functions related to displaying the AI highlights graph.
 */
const HighlightsGraphPlugin = (function () {

  /**
   * Plugin class constructor, called by videojs on
   * ready event.
   *
   * @function  constructor
   * @param    {Player} player
   *           A Video.js player object.
   *
   * @param    {Object} [options={}]
   *           A plain object containing options for the plugin.
   */
  function HighlightsGraphPlugin(player, options) {
    this.player = player;
    this.options = options;
    this.initializeHighlightsGraph();
    this.registeredEvents = {};
    return this;
  }

  HighlightsGraphPlugin.prototype.src = function src(source) {
    this.resetPlugin();
    this.options.src = source;
    this.initializeHighlightsGraph();
  };

  HighlightsGraphPlugin.prototype.detach = function detach() {
    this.resetPlugin();
  };

  HighlightsGraphPlugin.prototype.resetPlugin = function resetPlugin() {
    if (this.graphHolder) {
      this.graphHolder.parentNode.removeChild(this.graphHolder);
    }
    delete this.progressBar;
    delete this.graphHolder;
    delete this.lastStyle;
  };

  /**
   * Bootstrap the plugin.
   */
  HighlightsGraphPlugin.prototype.initializeHighlightsGraph = function initializeHighlightsGraph() {
    if (!this.options.src) {
      return;
    }

    fetch(this.options.src).then((res) => {
      return res.json();
    }).then((res) => {
      this.setupHighlightsGraphElement();
      if (this.graphHolder) {
        this.createHighlightsGraph(res);
      }
    });
  };

  HighlightsGraphPlugin.prototype.setupHighlightsGraphElement = function setupHighlightsGraphElement() {
    const mouseDisplay = this.player.$('.vjs-mouse-display');
    this.progressBar = this.player.$('.vjs-progress-control');
    if (!this.progressBar) {
      return;
    }
    const graphHolder = this.player.$('.vjs-highlights-graph-display') || document.createElement('div');
    graphHolder.setAttribute('class', 'vjs-highlights-graph-display');
    this.progressBar.appendChild(graphHolder);
    this.graphHolder = graphHolder;
    if (mouseDisplay) {
      mouseDisplay.classList.add('vjs-hidden');
    }
  };

  /**
   * Function to create the SVG path element
   */
  HighlightsGraphPlugin.prototype.createPath = function createPath(dataArray, containerWidth, containerHeight) {
    // Calculate the x and y coordinates for each point
    const stepX = containerWidth / (dataArray.length - 1);
    const points = dataArray.map((value, index) => ({
      x: index * stepX,
      y: containerHeight - value * containerHeight
    }));

    // Create a smooth line path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'lightblue');

    // Generate the smooth line path data
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x},${points[i].y} ${xc},${yc}`;
    }
    d += ` Q ${points[points.length - 1].x},${points[points.length - 1].y} ${points[points.length - 1].x},${points[points.length - 1].y}`;

    // Close the path to fill the region under the line
    d += ` L ${points[points.length - 1].x},${containerHeight} L ${points[0].x},${containerHeight} Z`;

    path.setAttribute('d', d);

    return path;
  };

  HighlightsGraphPlugin.prototype.createHighlightsGraph = function createHighlightsGraph(info) {
    const data = info.data;
    const svgWidth = 600;
    const svgHeight = 20;

    const svg = this.player.$('.vjs-highlights-graph-display > svg') || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);
    svg.innerHTML = '';

    const path = this.createPath(data, svgWidth, svgHeight);
    svg.appendChild(path);

    this.graphHolder.appendChild(svg);
  };

  return HighlightsGraphPlugin;
}());

export default aiHighlightsGraph;
