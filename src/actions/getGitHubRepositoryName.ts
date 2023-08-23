import { logError } from "../utils/log.js";
import { cliSync } from "../utils/cli.js";

export const getGitRemoteUrl = () => {
  const CONFIG = `${process.env.TARGET_DIR}/.git/config`;
  const remoteOriginUrl = cliSync(`git config --file="${CONFIG}" --get remote.origin.url`, true);
  return remoteOriginUrl;
};

export const getGitHubRepositoryName = () => {
  try {
    const remoteOriginUrl = getGitRemoteUrl();
    const repositoryName = remoteOriginUrl.match(/(?<=github\.com:)[^\s]+(?=.*\.git)/)[0];
    return repositoryName;
  } catch (error) {
    logError({
      title: `An error occured inside getGitHubRepositoryName.`,
      message: error,
    });
  }
};
