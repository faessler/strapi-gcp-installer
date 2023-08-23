import { logChapter } from "./utils/log.js";
import { checkPrerequisites } from "./flows/checkPrerequisites.js";
import { setupVariables } from "./flows/setupVariables.js";
import { setupStrapi } from "./flows/setupStrapi.js";
import { setupGCP } from "./flows/setupGCP.js";
import { setupGitHub } from "./flows/setupGitHub.js";

(async () => {
  process.env.TARGET_DIR = process.argv[2];

  // Check prerequisites
  logChapter("[1/5] Checking Prerequisites");
  await checkPrerequisites();

  // Setup Variables
  logChapter("[2/5] Customization");
  await setupVariables();

  // Setup Strapi
  logChapter("[3/5] Setup Strapi");
  await setupStrapi();

  // Setup Google Cloud Platform
  logChapter("[4/5] Setup Google Cloud Platform");
  await setupGCP();

  // Setup GitHub
  logChapter("[5/5] Setup GitHub");
  await setupGitHub();
})();
