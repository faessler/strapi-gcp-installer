import confirm from "@inquirer/confirm";
import { $ } from "src/utils/$.js";
import { logError } from "../../utils/log.js";
import { streamChildProcess } from "../../utils/streamChildProcess.js";
import { getGcpBillingAccounts } from "../../actions/getGcpBillingAccounts.js";

export const checkGoogleCloudPlatformPrerequisites = async () => {
  // check if gcloud is installed
  try {
    $(`gcloud --version`);
  } catch {
    logError({
      title: `Command "gcloud" is not installed!`,
      fix: `brew install --cask google-cloud-sdk`,
      docs: `https://cloud.google.com/sdk/docs/install`,
    });
  }

  // TODO #1: check for gcloud beta

  // check if gcloud command is authenticated
  try {
    const user = await $(`gcloud config get-value account`);
    if (user === "(unset)") {
      streamChildProcess(`gcloud`, [`auth`, `login`]);
    } else {
      const answer = await confirm({
        message: `You are currently logged in to Google as ${user}, do you want to continue with this account?`,
        default: true,
      });
      if (!answer) {
        await $(`gcloud auth revoke`);
        streamChildProcess(`gcloud`, [`auth`, `login`]);
      }
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
        message:
          "Your GCP account needs at least one active billing Account. Go to https://console.cloud.google.com/billing and create one.",
      });
    }
  } catch {
    logError({
      title: "Failed to fetch billing accounts",
      message:
        "Your GCP account needs at least one active billing Account. Go to https://console.cloud.google.com/billing and create one.",
    });
  }

  // todo: check if account has sufficient permissions

  console.log("");
};
