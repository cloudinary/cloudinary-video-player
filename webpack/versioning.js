const semver = require('semver');
const CURRENT_VERSION = require('../package.json').version;
const VALID_TAGS = ['edge', 'stable', 'dry'];

const nextEdgeVersion = () => semver.inc(CURRENT_VERSION, 'prerelease', undefined, 'edge');
const nextStableVersion = () => semver.inc(CURRENT_VERSION, 'patch');
const nextVersion = (tag) => (tag === 'edge') ? nextEdgeVersion() : nextStableVersion();

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

const getNextVersion = () => nextVersion(extractTag());


module.exports = { nextStableVersion, nextEdgeVersion, extractTag, getNextVersion };
