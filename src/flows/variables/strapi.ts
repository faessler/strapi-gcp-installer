import { resolve } from "path";
import { input, confirm } from "@inquirer/prompts";
import { hasExistingStrapiProject } from "../../utils/hasExistingStrapiProject.js";

export const setStrapiVariables = async () => {
  // default values
  process.env.STRAPI_DIR = ".";

  // set strapi directory
  process.env.STRAPI_DIR = await input({
    message: `In which directory do you want to create Strapi? (chance to put into subfolder in case of monorepo)`,
    default: process.env.STRAPI_DIR,
  });
  process.env.STRAPI_DIR = resolve(`${process.env.TARGET_DIR}/${process.env.STRAPI_DIR}`);

  // check if target dir contains strapi project
  if (hasExistingStrapiProject()) {
    const answer = await confirm({
      message: `⚠️  Strapi directory "${process.env.STRAPI_DIR}" contains existing Strapi project. This will skip the Strapi setup. Are you sure you want to continue with existing Strapi project?`,
      default: true,
    });
    if (!answer) {
      process.exit(0);
    }
  }

  console.log("");
};
