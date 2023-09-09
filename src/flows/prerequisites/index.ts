import { checkGitHubPrerequisites } from "./github.js";
import { checkGoogleCloudPlatformPrerequisites } from "./google-cloud-platform.js";

export const checkPrerequisites = async () => {
  await checkGoogleCloudPlatformPrerequisites();
  await checkGitHubPrerequisites();
};
