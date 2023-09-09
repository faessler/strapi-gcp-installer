import { input, select, confirm } from "@inquirer/prompts";
import { getGitHubRepositoryName, getGitRemoteUrl } from "../../actions/getGitHubRepositoryName.js";
import { isGitHubRepository } from "../../utils/isGitHubRepository.js";
import { isGitRepository } from "../../utils/isGitRepository.js";
import { isValidRepositoryName } from "../../utils/validate.js";

export const setGitHubVariables = async () => {
  // skip github actions setup if not wanted
  if (process.env.FLAG_GITHUB_ACTIONS === "false") {
    return;
  }

  const gitRemoteUrl = getGitRemoteUrl();
  // check if target dir is github repository
  if (isGitHubRepository) {
    const answer = await confirm({
      message: `⚠️  Target directory "${
        process.env.TARGET_DIR
      }" contains existing GitHub repository "${gitRemoteUrl.trim()}". Are you sure you want to continue with this directory?`,
      default: false,
    });
    if (!answer) process.exit(0);
    process.env.GITHUB_REPOSITORY = getGitHubRepositoryName();
  } else if (isGitRepository) {
    const answer = await confirm({
      message: `⚠️  Target directory "${
        process.env.TARGET_DIR
      }" contains existing git repository "${gitRemoteUrl.trim()}" which is not from github.com. This will skip the GitHub Actions setup. Are you sure you want to continue with this directory?`,
      default: false,
    });
    if (!answer) process.exit(0);
    process.env.GITHUB_REPOSITORY = null;
  } else {
    process.env.GITHUB_REPOSITORY = await input({
      message: `How do you want to name your GitHub repository?`,
      validate: async (value) => {
        if (!isValidRepositoryName(value)) {
          return `Must be in format [a-z]/[a-z] (e.g. foo/bar)`;
        }
        // TODO: add check if given repository doesn't exist yet
        // TODO: add check if gh user is allowed to create given repository
        return true;
      },
    });
    process.env.GITHUB_REPOSITORY_VISIBILITY = await select({
      message: "Visibility of the new repository",
      choices: [
        {
          value: "--public",
          description: "Make the new repository public",
        },
        {
          value: "--private",
          description: "Make the new repository private",
        },
        {
          value: "--internal",
          description: "Make the new repository internal",
        },
      ],
    });
  }

  console.log("");
};
