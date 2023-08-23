import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { input, select, confirm } from "@inquirer/prompts";
import { getGitHubRepositoryName, getGitRemoteUrl } from "../actions/getGitHubRepositoryName.js";
import { hasExistingStrapiProject } from "../utils/hasExistingStrapiProject.js";
import { isGitHubRepository } from "../utils/isGitHubRepository.js";
import { isGitRepository } from "../utils/isGitRepository.js";
import { log, logError } from "../utils/log.js";
import { isKebabCase, isSnakeCase, isValidRepositoryName } from "../utils/validate.js";
import { getGcpRegionChoices } from "../actions/getGcpRegionChoices.js";
import { getGcpBillingAccounts } from "../actions/getGcpBillingAccounts.js";

export const setupVariables = async () => {
  /*************************/
  /* FILE SYSTEM           */
  /*************************/
  // default values
  process.env.TARGET_DIR = resolve(process.env.TARGET_DIR);

  // check if target dir exists
  if (
    existsSync(process.env.TARGET_DIR) &&
    readdirSync(process.env.TARGET_DIR).filter((dir) => dir !== ".git").length > 0
  ) {
    const answer = await confirm({
      message: `⚠️  Target directory "${process.env.TARGET_DIR}" already exists. Existing files may be overwritten! Are you sure you want to continue with this directory?`,
      default: false,
    });
    log(``);
    if (!answer) {
      process.exit(0);
    }
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
  log(``);

  /*************************/
  /* STRAPI                */
  /*************************/
  // default values
  process.env.STRAPI_DIR = ".";

  // set strapi directory
  process.env.STRAPI_DIR = await input({
    message: `In which directory do you want to create Strapi? (chance to put into subfolder in case of monorepo)`,
    default: process.env.STRAPI_DIR,
  });
  log(``);
  process.env.STRAPI_DIR = resolve(`${process.env.TARGET_DIR}/${process.env.STRAPI_DIR}`);

  // check if target dir contains strapi project
  if (hasExistingStrapiProject()) {
    const answer = await confirm({
      message: `⚠️  Strapi directory "${process.env.STRAPI_DIR}" contains existing Strapi project. This will skip the Strapi setup. Are you sure you want to continue with existing Strapi project?`,
      default: true,
    });
    log(``);
    if (!answer) {
      process.exit(0);
    }
  }

  /*************************/
  /* GOOGLE CLOUD PLATFORM */
  /*************************/
  // default values
  process.env.GCP_REGION = process.env.GCP_REGION || "us-east1";
  process.env.GCP_GITHUB_ACTIONS_ROLE_ID = "github_actions_role";
  process.env.GCP_GITHUB_ACTIONS_SA = "github-actions-sa";
  process.env.GCP_GITHUB_ACTIONS_WIF_POOL = "github-actions-pool";

  // set billing account
  process.env.GCP_BILLING_ACCOUNT = await select({
    message: "GCP Billing account to link with new project",
    choices: getGcpBillingAccounts(),
  });
  log(``);

  // set project id
  process.env.GCP_PROJECT_ID = await input({
    message: "GCP Project ID (used to create new project with App Engine and Cloud Storage)",
    default: process.env.GCP_PROJECT_ID,
    validate: async (value) => {
      if (!isKebabCase(value)) {
        return `Project ID must be in format [A-Z a-z -] (Kebab Case)`;
      }
      // TODO: add check if project already exists, if yes ask if ok to use existing one, if not ok ask different name
      // TODO: add check if project can be created, if not ask for different name
      return true;
    },
  });
  log(``);

  // set region
  const appEngineRegions = getGcpRegionChoices();
  process.env.GCP_REGION = await select({
    message: "GCP Region (for Cloud Storage and App Engine)",
    choices: appEngineRegions.map((region: string) => ({
      value: region,
    })),
  });
  log(``);

  // set github actions role id
  process.env.GCP_GITHUB_ACTIONS_ROLE_ID = await input({
    message: "GCP GitHub Role ID (used by GitHub Actions service account)",
    default: process.env.GCP_GITHUB_ACTIONS_ROLE_ID,
    validate: (value) => {
      if (!isSnakeCase(value)) {
        return `Role ID must be in format [A-Z a-z _] (Snake Case)`;
      }
      // TODO: add check if role already exists, if yes ask if ok to use existing one, if not ok ask different id
      return true;
    },
  });
  log(``);

  // set github service account
  process.env.GCP_GITHUB_ACTIONS_SA = await input({
    message: "GCP Service Account (used by GitHub Actions)",
    default: process.env.GCP_GITHUB_ACTIONS_SA,
    validate: (value) => {
      if (!isKebabCase(value)) {
        return `Service Account must be in format [A-Z a-z -] (Kebab Case)`;
      }
      // TODO: add check if service account already exists, if yes ask if ok to use existing one, if not ok ask different name
      return true;
    },
  });
  log(``);

  // set github actions work identitiy federation pool
  process.env.GCP_GITHUB_ACTIONS_WIF_POOL = await input({
    message: "GCP Workload Identitiy Federation Pool (used by GitHub Actions)",
    default: process.env.GCP_GITHUB_ACTIONS_WIF_POOL,
    validate: (value) => {
      if (!isKebabCase(value)) {
        return `Workload Identity Federation Pool must be in format [A-Z a-z -] (Kebab Case)`;
      }
      // TODO: add check if wif pool already exists, if yes ask if ok to use existing one, if not ok ask different name
      return true;
    },
  });
  log(``);
};
