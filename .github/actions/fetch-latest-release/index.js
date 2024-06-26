const core = require('@actions/core');
const github = require('@actions/github');
const process = require('process');

async function findMostRecentRelease(owner, repo) {
  const octokit = github.getOctokit(core.getInput('github_token', { required: true }));

  const releases = await octokit.rest.repos.listReleases({
    owner: owner,
    repo: repo
  });

  // Filter out draft releases
  const nonDraftReleases = releases.data.filter(release => !release.draft);

  // Sort releases by creation date (you can also sort by published date if preferred)
  const sortedReleases = nonDraftReleases.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Get the most recent release, including prereleases but excluding drafts
  const latestRelease = sortedReleases[0];

  return latestRelease;
}

async function fetchLatestRelease() {
  const [owner, repo] = process.env['GITHUB_REPOSITORY'].split('/', 2);

  core.info(`Fetching the latest release for \`${owner}/${repo}\``);

  let latestRelease;

  try {
    latestRelease = await findMostRecentRelease({
      owner,
      repo
    });
  } catch (error) {
    core.info('Could not fetch the latest release. Have you made one yet?');
    core.setFailed(error);
  }

  core.setOutput('url', latestRelease.url);
  core.setOutput('assets_url', latestRelease.assets_url);
  core.setOutput('upload_url', latestRelease.upload_url);
  core.setOutput('html_url', latestRelease.html_url);
  core.setOutput('id', latestRelease.id.toString());
  core.setOutput('node_id', latestRelease.node_id);
  core.setOutput('tag_name', latestRelease.tag_name);
  core.setOutput('target_commitish', latestRelease.target_commitish);
  core.setOutput('name', latestRelease.name);
  core.setOutput('body', latestRelease.body);
  core.setOutput('draft', latestRelease.draft);
  core.setOutput('prerelease', latestRelease.prerelease);
  core.setOutput('author_id', latestRelease.author.id.toString());
  core.setOutput('author_node_id', latestRelease.author.node_id);
  core.setOutput('author_url', latestRelease.author.url);
  core.setOutput('author_login', latestRelease.author.login);
  core.setOutput('author_html_url', latestRelease.author.html_url);
  core.setOutput('author_type', latestRelease.author.type);
  core.setOutput('author_site_admin', latestRelease.author.site_admin);
}

try {
  fetchLatestRelease();
} catch (error) {
  core.setFailed(`Action failed with error ${error}`);
}
