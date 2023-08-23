import { cliSync } from "../utils/cli.js";
import { logError } from "../utils/log.js";

export const getGcpRolePermissions = (role: string) => {
  try {
    const roleDescription = JSON.parse(cliSync(`gcloud iam roles describe ${role} --format=json`));
    const roles = roleDescription.includedPermissions;
    return roles;
  } catch (error) {
    logError({
      title: `An error occured inside getGcpRolePermissions.`,
      message: error,
    });
  }
};
