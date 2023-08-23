import { readFileSync, writeFileSync } from "fs";
import { logError } from "../utils/log.js";

export const addGcpBuildNpmScript = () => {
  try {
    const filePath = `${process.env.STRAPI_DIR}/package.json`;
    const file = readFileSync(filePath, "utf-8");
    const packageJson = JSON.parse(file);
    packageJson.scripts = {
      ...packageJson.scripts,
      "gcp-build": "strapi build",
    };
    const json = JSON.stringify(packageJson, null, 2);
    writeFileSync(filePath, json);
  } catch (error) {
    logError({ title: `An error occured inside addGcpBuildNpmScript.`, message: error });
  }
};
