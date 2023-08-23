import { mkdirSync, writeFileSync } from "fs";
import { logError } from "../utils/log.js";

const data = `
name: "Deploy Strapi"

on:
  workflow_dispatch:
    inputs:
      instanceClass:
        description: "instance_class"
        required: true
        default: "F1"
        type: choice
        options:
          - F1
          - F2
          - F4
          - F4_1G
      minInstances:
        description: "min_instances"
        default: 1
        required: true
        type: number
      maxInstances:
        description: "max_instances"
        default: 1
        required: true
        type: number

jobs:
  deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: "read"
      id-token: "write"

    steps:
      - name: Checkout
        uses: "actions/checkout@v3"

      - name: "Apply env_variables to app.yaml"
        run: echo "\nenv_variables:\n\${{ secrets.STRAPI_ENV_VARIABLES }}" | sed -e 's/=/: /' | sed -e 's/^#.*//' | sed -e 's/^/  /' | sed -e 's/^  env_variables:/env_variables:/' >> \${{ variable.STRAPI_DIR }}/app.yaml

      - name: "Apply workflow dispatch inputs to app.yaml"
        run: |
          sed -i -e 's/instance_class:.*$/instance_class: \${{ inputs.instanceClass }}/g' \${{ variable.STRAPI_DIR }}/app.yaml
          sed -i -e 's/min_instances:.*$/min_instances: \${{ inputs.minInstances }}/g' \${{ variable.STRAPI_DIR }}/app.yaml
          sed -i -e 's/max_instances:.*$/max_instances: \${{ inputs.maxInstances }}/g' \${{ variable.STRAPI_DIR }}/app.yaml

      - name: Google Auth
        uses: "google-github-actions/auth@v1"
        with:
          workload_identity_provider: "\${{ secrets.GCP_WIF }}"
          service_account: "\${{ secrets.GCP_SA }}"

      - name: Google App Engine
        uses: "google-github-actions/deploy-appengine@v1"
        with:
          working_directory: \${{ variable.STRAPI_DIR }}
          project_id: \${{ secrets.GCP_PROJECT_ID }}

      - name: "Delete artifacts"
        run: gsutil -m rm -r gs://us.artifacts.\${{ secrets.GCP_PROJECT_ID }}.appspot.com
`;

export const createWorkflowDeployStrapi = () => {
  try {
    mkdirSync(`${process.env.TARGET_DIR}/.github/workflows/`, {
      recursive: true,
    });
    writeFileSync(`${process.env.TARGET_DIR}/.github/workflows/deploy-strapi.yml`, data);
  } catch (error) {
    logError({
      title: `An error occured inside createWorkflowDeployStrapi.`,
      message: error,
    });
  }
};
