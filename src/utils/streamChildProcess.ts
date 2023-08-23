import { spawn, spawnSync } from "child_process";

export const streamChildProcess = (command: string, args: string[]) => {
  // TODO: also abort parent process when spawnSync is aborted (ctrl+c)
  spawnSync(command, args, {
    stdio: "inherit",
  });
};
