import confirm from "@inquirer/confirm";
import { $ } from "../../utils/$.js";
import { logError } from "../../utils/log.js";
import { streamChildProcess } from "../../utils/streamChildProcess.js";

export const checkGitHubPrerequisites = async () => {
  // skip github actions setup if not wanted
  if (process.env.FLAG_GITHUB_ACTIONS === "false") {
    return;
  }

  // check if gh command is installed
  try {
    await $(`gh`);
  } catch {
    logError({
      title: `Command "gh" is not installed!`,
      fix: `brew install gh`,
      docs: `https://github.com/cli/cli#installation`,
    });
  }

  // check if gh command is authenticated
  try {
    const user = (await $(`gh auth status`)).match(/(?<=Logged in to ).*(?<=$)/gm);
    const answer = await confirm({
      message: `You are currently logged in to ${user}, do you want to continue with this account?`,
      default: true,
    });
    if (!answer) {
      await $(`gh auth logout`);
      streamChildProcess(`gh`, [`auth`, `login`]);
    }
  } catch {
    logError({
      title: `GitHub authentication failed!`,
      fix: `gh auth logout && gh auth login`,
      docs: `https://cli.github.com/manual/gh_auth_login`,
    });
  }

  console.log("");
};
