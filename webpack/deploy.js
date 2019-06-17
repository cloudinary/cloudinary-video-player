const ver = require('./versioning');
const { execSync } = require('child_process');
const tag = ver.extractTag();
const VERSION = (process.env.deploy === 'true')
  ? JSON.stringify(ver.getNextVersion(tag))
  : JSON.stringify(require('../package.json').version);
const versionCmd = () => `npm version ${VERSION}`;
const publishCmd = (tag) => {
  let cmd = 'npm publish';

  if (tag === 'edge') {
    cmd += ` --tag ${tag}`;
  }

  return cmd;
};

if (tag === 'dry') {
  console.log(`"edge" will deploy: "${ver.getNextVersion('edge')}"`);
  console.log(`"stable" will deploy: "${ver.getNextVersion('stable')}"`);
  console.log(`"minor" will deploy: "${ver.getNextVersion('minor')}"`);
  console.log(`"major" will deploy: "${ver.getNextVersion('major')}"`);
} else {
  const cmd = `${versionCmd()} && ${publishCmd(tag)}`;
  console.log(`Executing: "${cmd}" ...`);
  execSync(cmd);
}
