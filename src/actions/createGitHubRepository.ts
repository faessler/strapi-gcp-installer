import { cliSync } from "../utils/cli.js";
import { log, logError } from "../utils/log.js";

export const createGitHubRepository = async () => {
  try {
    const TARGET_DIR = process.env.TARGET_DIR;
    const REPOSITORY = process.env.GITHUB_REPOSITORY;
    const VISIBILITY = process.env.GITHUB_REPOSITORY_VISIBILITY;

    if (!REPOSITORY && !VISIBILITY) {
      log("⏭️  Skipping repository creation");
    } else {
      // create repository
      cliSync(`gh repo create ${REPOSITORY} ${VISIBILITY}`);

      // link locally
      cliSync(`gh repo clone ${REPOSITORY} ${TARGET_DIR}/.temp`);
      cliSync(`mv ${TARGET_DIR}/.temp/.git ${TARGET_DIR}/.git`);
      cliSync(`rm -r ${TARGET_DIR}/.temp`);
    }
  } catch (error) {
    logError({ title: `An error occured inside setupStrapi.`, message: error });
  }
};
