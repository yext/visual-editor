import { chat, puckHandler } from "@puckeditor/cloud-client";
import { PagesHttpRequest, PagesHttpResponse } from "@yext/pages";
import { puckAiSystemContext, enabledAiComponents } from "@yext/visual-editor";

const POST = async (request: PagesHttpRequest): Promise<PagesHttpResponse> => {
  const body = JSON.parse(request.body) as Parameters<typeof chat>[0];

  const requestBodyWithFilteredConfig = {
    ...body,
    config: {
      ...body.config,
      components: Object.fromEntries(
        Object.entries(body.config.components).filter(([key]) => {
          return (enabledAiComponents as string[]).includes(key);
        }),
      ),
    },
  };

  const puckRequest = new Request(
    `${request.headers.origin}/api/puck/${request.pathParams.route}`,
    {
      method: "POST",
      body: JSON.stringify(requestBodyWithFilteredConfig),
    },
  );

  const puckResponse = await puckHandler(puckRequest, {
    ai: {
      context: puckAiSystemContext,
    },
    // @ts-expect-error(2304)
    apiKey: PUCK_API_KEY,
  });

  return {
    statusCode: puckResponse.status,
    body: await puckResponse.text(),
    headers: Object.fromEntries(puckResponse.headers),
  };
};

export default POST;
