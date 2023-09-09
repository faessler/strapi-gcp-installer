import { setupGitHub } from "./github.js";
import { setupGoogleCloudPlatform } from "./google-cloud-platform.js";
import { setupStrapi } from "./strapi.js";

export const setup = async () => {
  await setupStrapi();
  await setupGoogleCloudPlatform();
  await setupGitHub();
};
