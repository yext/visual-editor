import { PagesHttpRequest, PagesHttpResponse } from "@yext/pages";
import {
  forwardPuckAiRequest,
  notFoundResponse,
} from "../../../../utils/puckProxy.ts";

/**
 * Proxies starter-owned Puck AI requests so local starter dev can serve the
 * same `/api/puck/*` contract expected by the AI plugin.
 */
export default async function puck(
  request: PagesHttpRequest,
): Promise<PagesHttpResponse> {
  const endpoint = request.pathParams.endpoint;
  if (endpoint !== "chat") {
    return notFoundResponse();
  }

  return forwardPuckAiRequest(request, endpoint);
}
