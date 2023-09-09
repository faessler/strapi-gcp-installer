import { logChapter } from "./utils/log.js";
import { getFlags } from "./actions/getFlags.js";
import { checkPrerequisites } from "./flows/prerequisites/index.js";
import { setVariables } from "./flows/variables/index.js";
import { setup } from "./flows/setup/index.js";

(async () => {
  process.env.TARGET_DIR = process.argv[2];
  const flags = getFlags();
  process.env.FLAG_VERBOSE = flags?.["verbose"] ?? "false";
  process.env.FLAG_GITHUB_ACTIONS = flags?.["github-actions"] ?? "true";

  // Check prerequisites
  logChapter("[1/3] Checking Prerequisites");
  await checkPrerequisites();

  // Set variables
  logChapter("[2/3] Customization");
  await setVariables();
  // await setupVariables();

  // Setup
  logChapter("[3/3] Setup project");
  await setup();
})();
