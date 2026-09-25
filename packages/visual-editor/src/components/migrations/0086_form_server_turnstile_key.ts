import { Migration } from "../../utils/migrate.ts";

export const formServerTurnstileKeyMigration: Migration = {
  FormSection: {
    action: "updated",
    propTransformation: (props) => {
      if (!props.data || !("turnstileSiteKey" in props.data)) {
        return props;
      }
      const { turnstileSiteKey: _oldSiteKey, ...data } = props.data;
      return { ...props, data };
    },
  },
};
