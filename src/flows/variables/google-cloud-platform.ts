import { input, select } from "@inquirer/prompts";
import { isKebabCase, isSnakeCase } from "../../utils/validate.js";
import { getGcpRegionChoices } from "../../actions/getGcpRegionChoices.js";
import { getGcpBillingAccounts } from "../../actions/getGcpBillingAccounts.js";

export const setGoogleCloudPlatformVariables = async () => {
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

  // set region
  const appEngineRegions = getGcpRegionChoices();
  process.env.GCP_REGION = await select({
    message: "GCP Region (for Cloud Storage and App Engine)",
    choices: appEngineRegions.map((region: string) => ({
      value: region,
    })),
  });

  // skip github actions setup if not wanted
  if (process.env.FLAG_GITHUB_ACTIONS === "false") {
    return;
  }

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

  console.log("");
};
