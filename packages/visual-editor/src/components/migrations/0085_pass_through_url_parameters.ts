import { type Migration } from "../../utils/migrate.ts";

export const passThroughUrlParametersDefault: Migration = {
  root: {
    propTransformation: (
      props: Record<string, unknown>
    ): Record<string, unknown> => ({
      passThroughUrlParameters: false,
      ...props,
    }),
  },
};
