const ver = require('./versioning');
const { execSync } = require('child_process');
const tag = ver.extractTag();
const versionCmd = () => `npm version ${VERSION}`;
const publishCmd = (tag) => {
  let cmd = 'npm publish';

  if (tag !== 'stable') {
    cmd += ` --tag ${tag}`;
  }

  return cmd;
};


if (tag === 'dry') {
  console.log(`"edge" will deploy: "${ver.nextEdgeVersion()}"`);
  console.log(`"stable" will deploy: "${ver.nextStableVersion()}"`);
} else {
  const cmd = `${versionCmd()} && ${publishCmd(tag)}`;
  console.log(`Executing: "${cmd}" ...`);
  execSync(cmd);
}
