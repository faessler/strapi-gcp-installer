import { writeFileSync } from "fs";
import { logError } from "../utils/log.js";

const data = `.git/
.gitignore
.env
.strapi-updater.json
.cache/
dist/
node_modules/
.gcloudignore
app.yaml
dispatch.yaml
`;

export const createDotGcloudignore = () => {
  try {
    writeFileSync(`${process.env.STRAPI_DIR}/.gcloudignore`, data);
  } catch (error) {
    logError({ title: `An error occured inside createDotGcloudignore.`, message: error });
  }
};
