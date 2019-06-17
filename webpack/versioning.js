const semver = require('semver');
const CURRENT_VERSION = require('../package.json').version;
const VALID_TAGS = ['edge', 'stable', 'minor', 'major', 'dry'];

const nextSemver = {
  'edge': () => semver.inc(CURRENT_VERSION, 'prerelease', undefined, 'edge'),
  'stable': () => semver.inc(CURRENT_VERSION, 'patch'),
  'minor': () => semver.inc(CURRENT_VERSION, 'minor'),
  'major': () => semver.inc(CURRENT_VERSION, 'major')
};

const extractTag = () => {
  let tag = process.env.npm_config_tag;
  console.log('Current config tag: "' + tag + '"');

  if (!tag) {
    return 'edge';
  }

  if (!VALID_TAGS.find((t) => t === tag)) {
    throw new Error(`Invalid tag ${tag}. Valid tags are: ${VALID_TAGS.join(', ')}`);
  }

  return tag;
};

const getNextVersion = (tag) => nextSemver[tag] ? nextSemver[tag]() : console.log('No tag specified: ', tag);

module.exports = { extractTag, getNextVersion };
