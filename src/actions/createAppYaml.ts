import { writeFileSync } from "fs";
import { logError } from "../utils/log.js";

const data = `env: standard
runtime: nodejs18
instance_class: F1
automatic_scaling:
  max_instances: 1
  min_instances: 1
handlers:
  - url: /.*
    secure: always
    script: auto
`;

export const createAppYaml = () => {
  try {
    writeFileSync(`${process.env.STRAPI_DIR}/app.yaml`, data);
  } catch (error) {
    logError({ title: `An error occured inside createAppYaml.`, message: error });
  }
};
