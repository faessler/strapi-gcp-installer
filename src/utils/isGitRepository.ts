import { resolve } from "path";
import { cliSync } from "./cli.js";

export const isGitRepository = (() => {
  const TARGET_DIR = resolve(process.argv[2]);
  const CONFIG = `${TARGET_DIR}/.git/config`;
  const gitRemoteUrl = cliSync(`git config --file="${CONFIG}" --get remote.origin.url || true`);

  return !!gitRemoteUrl;
})();
