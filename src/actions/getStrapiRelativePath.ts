import { relative } from "path";
import { logError } from "../utils/log.js";

export const getStrapiRelativePath = () => {
  try {
    return `./${relative(process.env.TARGET_DIR, process.env.STRAPI_DIR)}`.replace(/^\.\/$/, ".");
  } catch (error) {
    logError({ title: `An error occured inside getStrapiRelativePath.`, message: error });
  }
};
