import { PagesHttpRequest, PagesHttpResponse } from "@yext/pages";
import { forwardPuckAiRequest } from "../../../../../utils/puckProxy.ts";

/**
 * Exposes the nested Puck AI tool route used by the plugin during chat flows.
 */
export default async function puckChatTool(
  request: PagesHttpRequest,
): Promise<PagesHttpResponse> {
  return forwardPuckAiRequest(request, "chat/tool");
}
