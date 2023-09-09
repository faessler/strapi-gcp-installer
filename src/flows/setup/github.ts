import { $ } from "src/utils/$.js";
import { getStrapiRelativePath } from "../../actions/getStrapiRelativePath.js";
import { log, logError } from "../../utils/log.js";
import { getStrapiDotEnvFile } from "../../actions/getStrapiDotEnvFile.js";
import { createWorkflowDeployStrapi } from "../../actions/createWorkflowDeployStrapi.js";
import { createGitHubRepository } from "../../actions/createGitHubRepository.js";

export const setupGitHub = async () => {
  try {
    // Create Repository
    await createGitHubRepository();

    // Setup Actions
    if (!process.env.GITHUB_REPOSITORY) {
      log("⏭️  Skipping GitHub Actions");
    } else {
      // create workflow
      createWorkflowDeployStrapi();

      // create secrets
      const secrets = {
        STRAPI_DIR: getStrapiRelativePath(),
        STRAPI_ENV_VARIABLES: getStrapiDotEnvFile(),
        GCP_SA: `${process.env.GCP_GITHUB_ACTIONS_SA}@${process.env.GCP_PROJECT_ID}.iam.gserviceaccount.com`,
        GCP_WIF: process.env.GCP_GITHUB_ACTIONS_WIF,
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
      };
      for (const [name, body] of Object.entries(secrets)) {
        await $(
          `gh ${
            name === "STRAPI_DIR" ? "variable" : "secret"
          } set ${name} --body="${body}" --repo="${process.env.GITHUB_REPOSITORY}"`,
        );
      }
    }
  } catch (error) {
    logError({
      title: `An error occured inside setupGitHub.`,
      message: error,
    });
  }

  console.log("");
};
