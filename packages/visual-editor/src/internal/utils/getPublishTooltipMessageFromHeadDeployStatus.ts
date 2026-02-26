import { HeadDeployStatus } from "../types/templateMetadata.ts";
import { pt } from "../../utils/i18n/platform.ts";

export const getPublishTooltipMessageFromHeadDeployStatus = (
  headDeployStatus: HeadDeployStatus
): string | undefined => {
  switch (headDeployStatus) {
    case "RUNNING":
      return pt(
        "publishBlocked.deploymentInProgress",
        "Update is disabled while deployment is in progress"
      );
    case "FAILED":
      return pt(
        "publishBlocked.deploymentFailed",
        "The last deployment failed. Please fix the issues and try again."
      );
    case "INACTIVE":
      return pt(
        "publishBlocked.deploymentInactive",
        "Publish is disabled because the deployment is inactive."
      );
    default:
      return undefined;
  }
};
