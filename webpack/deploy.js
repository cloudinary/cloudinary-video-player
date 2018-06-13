const semver = require('semver');
const { execSync } = require('child_process');

const CURRENT_VERSION = require('../package.json').version;

const nextEdgeVersion = () => semver.inc(CURRENT_VERSION, 'prerelease', undefined, 'edge');
const nextStableVersion = () => semver.inc(CURRENT_VERSION, 'patch');
const nextVersion = () => {
  const tag = process.argv[2];
  return (tag === 'edge') ? nextEdgeVersion() : nextStableVersion();
};

const cmd = `npm version ${nextVersion()}`;

execSync(cmd);
