import { setFileSystemVariables } from "./file-system.js";
import { setGitHubVariables } from "./github.js";
import { setGoogleCloudPlatformVariables } from "./google-cloud-platform.js";
import { setStrapiVariables } from "./strapi.js";

export const setVariables = async () => {
  await setFileSystemVariables();
  await setStrapiVariables();
  await setGoogleCloudPlatformVariables();
  await setGitHubVariables();
};
