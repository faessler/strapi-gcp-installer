import { cliSync } from "../utils/cli.js";
import { logError } from "../utils/log.js";

export const getGcpAppEngineRegions = () => {
  try {
    const stdout = cliSync(`gcloud app regions list`);
    const regions = stdout.match(/^.*-[^\s]+/gm);
    return regions;
  } catch (error) {
    logError({
      title: `An error occured inside getGcpAppEngineRegions.`,
      message: error,
    });
  }
};

export const getGcpRegionChoices = () => {
  try {
    const regions = getGcpAppEngineRegions();
    const sortedRegions = regions.reduce<string[]>((accumulator, region) => {
      // Default
      if (region === process.env.GCP_REGION) {
        accumulator.splice(0, 0, region);
        return accumulator;
      }

      // Free
      if (/^us-east1|us-west1|us-central$/.test(region)) {
        accumulator.splice(accumulator.indexOf(process.env.GCP_REGION) + 1, 0, region);
        return accumulator;
      }

      // Paid
      return [...accumulator, region];
    }, []);

    return sortedRegions;
  } catch (error) {
    logError({
      title: `An error occured inside getGcpRegionChoices.`,
      message: error,
    });
  }
};
