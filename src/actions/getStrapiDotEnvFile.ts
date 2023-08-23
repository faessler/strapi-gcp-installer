import { readFileSync } from "fs";
import { logError } from "../utils/log.js";

export const getStrapiDotEnvFile = () => {
  try {
    const filePath = `${process.env.STRAPI_DIR}/.env`;
    const file = readFileSync(filePath, "utf-8");
    const dotEnv = file;
    const dotEnvForAppEngine = dotEnv
      .replace(/(?<=HOST=).*$/m, "0.0.0.0")
      .replace(/(?<=PORT=).*$/m, "8080");
    return dotEnvForAppEngine;
  } catch (error) {
    logError({
      title: `An error occured inside getStrapiDotEnvFile.`,
      message: error,
    });
  }
};
