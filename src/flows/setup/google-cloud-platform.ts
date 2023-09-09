import { $ } from "src/utils/$.js";
import { log, logError } from "../../utils/log.js";
import { addGcpBuildNpmScript } from "../../actions/addCloudBuildNpmScript.js";
import { createAppYaml } from "../../actions/createAppYaml.js";
import { createDotGcloudignore } from "../../actions/createDotGcloudignore.js";
import { getGcpRolePermissions } from "../../actions/getGcpRolePermissions.js";
import { wait } from "../../utils/wait.js";

export const setupGoogleCloudPlatform = async () => {
  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  let PROJECT_NUMBER;
  const REGION = process.env.GCP_REGION;
  const BILLING_ACCOUNT = process.env.GCP_BILLING_ACCOUNT;
  const GITHUB_ROLE_ID = process.env.GCP_GITHUB_ACTIONS_ROLE_ID;
  const GITHUB_SA = process.env.GCP_GITHUB_ACTIONS_SA;
  const GITHUB_WIF_POOL = process.env.GCP_GITHUB_ACTIONS_WIF_POOL;
  const GITHUB_WIF_PROVIDER = "github";
  const REPOSITORY = process.env.GITHUB_REPOSITORY;

  try {
    // project
    await $(`gcloud projects create ${PROJECT_ID}`);
    PROJECT_NUMBER = (await $(`gcloud projects describe ${PROJECT_ID}`)).match(
      /(?<=projectNumber: ')[^\s]+(?=')/gm,
    )[0];

    // billing
    await $(`gcloud beta billing projects link ${PROJECT_ID} --billing-account ${BILLING_ACCOUNT}`);
    await wait();

    // services
    await $(
      `gcloud services enable iamcredentials.googleapis.com appengine.googleapis.com cloudbuild.googleapis.com --project="${PROJECT_ID}"`,
    );

    // app engine
    await $(`gcloud app create --project="${PROJECT_ID}" --region="${REGION}"`);
    // cliSync(`gsutil lifecycle set <config-json-file> gs://staging.${PROJECT_ID}.appspot.com`);
    // {"rule": [{"action": {"type": "Delete"}, "condition": {"age": 1}}]}
    createAppYaml();
    createDotGcloudignore();
    addGcpBuildNpmScript();

    // only create roles, service account and wif when GitHub actions is wanted
    if (!!REPOSITORY) {
      // workload identitiy pool and provider for github
      log("Waiting three minutes so GCP has time to create neede resources in background");
      await wait(180000); // wait for all recourses to be created (prevents PERMISSION_DENIED (or it may not exist) error)
      await $(
        `gcloud iam workload-identity-pools create ${GITHUB_WIF_POOL} --display-name="GitHub Actions" --location="global" --project="${PROJECT_ID}"`,
      );
      await $(
        `gcloud iam workload-identity-pools providers create-oidc ${GITHUB_WIF_PROVIDER} --display-name="GitHub" --issuer-uri="https://token.actions.githubusercontent.com" --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" --attribute-condition="assertion.repository=='${REPOSITORY}'" --location="global" --workload-identity-pool="${GITHUB_WIF_POOL}" --project="${PROJECT_ID}"`,
      );

      // skip github actions setup if not wanted
      if (process.env.FLAG_GITHUB_ACTIONS === "false") {
        return;
      }

      // custom role for github
      const permissions = [
        ...new Set(
          [
            "roles/appengine.appAdmin",
            "roles/storage.admin",
            "roles/cloudbuild.builds.editor",
            "roles/iam.serviceAccountUser",
          ].flatMap((role) => getGcpRolePermissions(role)),
        ),
      ]
        .filter(
          (role) =>
            !["resourcemanager.projects.list", "appengine.runtimes.actAsAdmin"].includes(role),
        )
        .join(",");
      await wait();
      await $(
        `gcloud iam roles create ${GITHUB_ROLE_ID} --project="${PROJECT_ID}" --title="roles/github-actions" --permissions="${permissions}" --quiet`,
      );
      await wait();

      // service account for github (with previously created role and access to workload identity pool)
      await $(
        `gcloud iam service-accounts create ${GITHUB_SA} --display-name="GitHub Actions SA" --project="${PROJECT_ID}"`,
      );
      await $(
        `gcloud projects add-iam-policy-binding ${PROJECT_ID} --member="serviceAccount:${GITHUB_SA}@${PROJECT_ID}.iam.gserviceaccount.com" --role="projects/${PROJECT_ID}/roles/${GITHUB_ROLE_ID}" --project="${PROJECT_ID}"`,
      );
      await $(
        `gcloud iam service-accounts add-iam-policy-binding ${GITHUB_SA}@${PROJECT_ID}.iam.gserviceaccount.com --role="roles/iam.workloadIdentityUser" --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GITHUB_WIF_POOL}/*" --project="${PROJECT_ID}"`,
      );

      process.env.GCP_GITHUB_ACTIONS_WIF = `projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GITHUB_WIF_POOL}/providers/${GITHUB_WIF_PROVIDER}`;
    }
  } catch (error) {
    logError({
      title: `An error occured inside setupGCP.`,
      message: error,
    });
  }

  console.log("");
};
