const core = require('@actions/core');
const semver = require('semver');

try {
  let packageVersion = core.getInput('version', { require: true });

  // Remove initial v if present
  if (packageVersion.charAt(0) === 'v') {
    packageVersion = packageVersion.substring(1);
  }

  core.setOutput('next-edge', semver.inc(packageVersion, 'prerelease', undefined, 'edge'));
} catch (error) {
  core.setFailed(`Action failed to transform input with error: ${error.message}`);
}
