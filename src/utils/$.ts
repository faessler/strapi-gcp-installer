import { exec } from "child_process";

export const $: (command: string) => Promise<string> = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (process.env.FLAG_VERBOSE === "true") {
        console.warn(stderr);
      }
      if (error) {
        reject(error);
      }
      if (stdout) {
        resolve(stdout);
      }
    });
  });
};
