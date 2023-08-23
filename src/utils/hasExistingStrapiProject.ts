import { existsSync, readdirSync } from "fs";

export const hasExistingStrapiProject = () => {
  return (
    existsSync(process.env.STRAPI_DIR) &&
    readdirSync(process.env.STRAPI_DIR).some((file) => file === "package.json")
  );
};
