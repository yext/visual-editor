# GitHub Workflows

This directory contains GitHub Actions workflows for the visual-editor repository.

## Create Dev Release Workflow

The `create-dev-release.yml` workflow automatically creates a development release when a pull request is labeled with `create-dev-release`.

### How to Use

1. **Create a Pull Request** with your changes
2. **Add the `create-dev-release` label** to the PR
3. The workflow will automatically:
   - Build the package
   - Publish a temporary version using `pkg.pr.new`
   - Notify the `YextSolutions/pages-visual-editor-starter` repository

### Required Secrets

The following secrets must be configured in your repository settings:

- `NPM_TOKEN`: Your NPM authentication token for publishing packages
- `WEBSITE_REPO_PAT`: A Personal Access Token with permissions to trigger repository dispatch events on the starter repository

### What Happens

1. **Trigger**: When a PR is labeled with `create-dev-release`
2. **Build**: The package is built using `pnpm run build`
3. **Publish**: A temporary version is published using `pkg.pr.new publish`
4. **Notify**: The starter repository is notified via repository dispatch with:
   - PR number
   - Branch name
   - PR title
   - PR URL
   - Author information

### Repository Dispatch Event

The workflow sends a `dev-release-created` event to the `YextSolutions/pages-visual-editor-starter` repository with the following payload:

```json
{
  "pr_number": "123",
  "branch_name": "pr-123",
  "pr_title": "Feature: Add new component",
  "pr_url": "https://github.com/yext/visual-editor/pull/123",
  "author": "username",
  "package_url": "https://pkg.pr.new/yext/visual-editor@123"
}
```

The starter repository can listen for this event and automatically update its dependencies to use the new dev release for testing.
