import { hasExistingStrapiProject } from "../../utils/hasExistingStrapiProject.js";
import { log, logError } from "../../utils/log.js";
import { streamChildProcess } from "../../utils/streamChildProcess.js";

export const setupStrapi = async () => {
  try {
    if (hasExistingStrapiProject()) {
      log("⏭️  Skipping Strapi installation");
    } else {
      streamChildProcess(`npx`, [`create-strapi-app@latest`, process.env.STRAPI_DIR, `--no-run`]);
    }
  } catch (error) {
    logError({ title: `An error occured inside setupStrapi.`, message: error });
  }
  console.log("");
};
