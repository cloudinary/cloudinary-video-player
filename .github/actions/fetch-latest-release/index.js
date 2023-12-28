const core = require('@actions/core')
const github = require('@actions/github')
const process = require('process')

const customRepo = (repoPath) => {
  const segments = repoPath.split('/', 2)

  if (segments.length < 2) {
    core.info('Please provide a repository in the format `owner/repo`.')
  }

  return segments
}

const repoInput = core.getInput('repo_path')

const [owner, repo] = repoInput
  ? customRepo(repoInput)
  : process.env['GITHUB_REPOSITORY'].split('/', 2)

const octokit = github.getOctokit(
  core.getInput('github_token', { required: true })
)

async function run() {
  let latestRelease

  core.info(`Fetching the latest release for \`${owner}/${repo}\``)

  try {
    latestRelease = await octokit.repos.getLatestRelease({
      owner,
      repo,
    })
  } catch (error) {
    core.info('Could not fetch the latest release. Have you made one yet?')
    core.setFailed(error)
  }

  const { data } = latestRelease

  core.setOutput('url', data.url)
  core.setOutput('assets_url', data.assets_url)
  core.setOutput('upload_url', data.upload_url)
  core.setOutput('html_url', data.html_url)
  core.setOutput('id', data.id.toString())
  core.setOutput('node_id', data.node_id)
  core.setOutput('tag_name', data.tag_name)
  core.setOutput('target_commitish', data.target_commitish)
  core.setOutput('name', data.name)
  core.setOutput('body', data.body)
  core.setOutput('draft', data.draft)
  core.setOutput('prerelease', data.prerelease)
  core.setOutput('author_id', data.author.id.toString())
  core.setOutput('author_node_id', data.author.node_id)
  core.setOutput('author_url', data.author.url)
  core.setOutput('author_login', data.author.login)
  core.setOutput('author_html_url', data.author.html_url)
  core.setOutput('author_type', data.author.type)
  core.setOutput('author_site_admin', data.author.site_admin)
}

try {
  run()
} catch (error) {
  core.setFailed(`Action failed with error ${error}`)
}
