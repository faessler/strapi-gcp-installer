import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { confirm } from "@inquirer/prompts";

export const setFileSystemVariables = async () => {
  // default values
  process.env.TARGET_DIR = resolve(process.env.TARGET_DIR);

  // check if target dir exists
  if (
    existsSync(process.env.TARGET_DIR) &&
    readdirSync(process.env.TARGET_DIR).filter((dir) => dir !== ".git").length > 0
  ) {
    const answer = await confirm({
      message: `⚠️  Target directory "${process.env.TARGET_DIR}" already exists. Existing files may be overwritten! Are you sure you want to continue with this directory?`,
      default: false,
    });
    if (!answer) {
      process.exit(0);
    }

    console.log("");
  }
};
