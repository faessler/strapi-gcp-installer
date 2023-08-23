import { exec, execSync } from "child_process";
import { logError } from "./log.js";

export const cli = (command: string) =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        logError({ title: "An error occured inside cli.", message: String(error || stderr) });
        reject(error || stderr);
      } else {
        resolve(stdout);
      }
    });
  });

export const cliSync = (command: string, isAllowedToFail = false) => {
  try {
    return execSync(command).toString().trim();
  } catch (error) {
    if (!isAllowedToFail) {
      throw error;
    }
  }
};
