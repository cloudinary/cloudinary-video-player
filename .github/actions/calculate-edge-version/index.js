const core = require('@actions/core');
const semver = require('semver');

try {
  const packageVersion = core.getInput('version', { require: true });
  core.setOutput('next-edge', semver.inc(packageVersion, 'prerelease', undefined, 'edge'));
} catch (error) {
  core.setFailed(`Action failed to transform input with error: ${error.message}`);
}
