import confirm from "@inquirer/confirm";
import { cliSync } from "../utils/cli.js";
import { logError, log } from "../utils/log.js";
import { streamChildProcess } from "../utils/streamChildProcess.js";
import { getGcpBillingAccounts } from "../actions/getGcpBillingAccounts.js";

export const checkPrerequisites = async () => {
  // [1/2] GCP
  // check if gcloud is installed
  try {
    cliSync(`gcloud --version`);
  } catch {
    logError({
      title: `Command "gcloud" is not installed!`,
      fix: `brew install --cask google-cloud-sdk`,
      docs: `https://cloud.google.com/sdk/docs/install`,
    });
  }

  // check if gcloud command is authenticated
  try {
    const user = cliSync(`gcloud config get-value account`);
    if (user === "(unset)") {
      streamChildProcess(`gcloud`, [`auth`, `login`]);
    } else {
      const answer = await confirm({
        message: `You are currently logged in to Google as ${user}, do you want to continue with this account?`,
        default: true,
      });
      if (!answer) {
        cliSync(`gcloud auth revoke`);
        streamChildProcess(`gcloud`, [`auth`, `login`]);
      }
      log("");
    }
  } catch {
    logError({
      title: `Google authentication failed!`,
      fix: `gcloud auth login`,
      docs: `https://cloud.google.com/sdk/gcloud/reference/auth/login`,
    });
  }

  // check if at least one billing account exists
  try {
    const billingAccounts = getGcpBillingAccounts();
    if (billingAccounts.length === 0) {
      logError({
        title: "No billing accounts found",
        message: "Your GCP account needs at least one active billing Account. Go to https://console.cloud.google.com/billing and create one."
      })
    }
  } catch {
    logError({
      title: "Failed to fetch billing accounts",
      message: "Your GCP account needs at least one active billing Account. Go to https://console.cloud.google.com/billing and create one."
    })
  }

  // todo: check if account has sufficient permissions

  // [2/2] GITHUB
  // check if gh command is installed
  try {
    cliSync(`gh`);
  } catch {
    logError({
      title: `Command "gh" is not installed!`,
      fix: `brew install gh`,
      docs: `https://github.com/cli/cli#installation`,
    });
  }

  // check if gh command is authenticated
  try {
    const user = cliSync(`gh auth status`).match(/(?<=Logged in to ).*(?<=$)/gm);
    const answer = await confirm({
      message: `You are currently logged in to ${user}, do you want to continue with this account?`,
      default: true,
    });
    if (!answer) {
      cliSync(`gh auth logout`);
      streamChildProcess(`gh`, [`auth`, `login`]);
    }
    log("");
  } catch {
    logError({
      title: `GitHub authentication failed!`,
      fix: `gh auth logout && gh auth login`,
      docs: `https://cli.github.com/manual/gh_auth_login`,
    });
  }
};
