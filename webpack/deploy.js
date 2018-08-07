const semver = require('semver');
const { execSync } = require('child_process');

const CURRENT_VERSION = require('../package.json').version;
const VALID_TAGS = ['edge', 'stable', 'dry'];

const nextEdgeVersion = () => semver.inc(CURRENT_VERSION, 'patch', undefined, 'edge');
const nextStableVersion = () => semver.inc(CURRENT_VERSION, 'minor');
const nextVersion = (tag) => (tag === 'edge') ? nextEdgeVersion() : nextStableVersion();

const versionCmd = (tag) => `npm version ${nextVersion(tag)}`;

const publishCmd = (tag) => {
  let cmd = 'npm publish';

  if (tag !== 'stable') {
    cmd += ` --tag ${tag}`;
  }

  return cmd;
};

const extractTag = () => {
  let tag = process.argv[2];

  if (!tag) {
    return 'edge';
  }

  if (!VALID_TAGS.find((t) => t === tag)) {
    throw new Error(`Invalid tag ${tag}. Valid tags are: ${VALID_TAGS.join(', ')}`);
  }

  return tag;
};

const tag = extractTag();

if (tag === 'dry') {
  console.log(`"edge" will deploy: "${nextEdgeVersion()}"`);
  console.log(`"stable" will deploy: "${nextStableVersion()}"`);
} else {
  const cmd = `${versionCmd(tag)} && ${publishCmd(tag)}`;
  console.log(`Executing: "${cmd}" ...`);
  execSync(cmd);
}
