import { Migration } from "../../utils/migrate.ts";

const defaultLinkOverride = {
  enabled: false,
  normalizeLink: false,
  field: "",
  constantValue: {
    defaultValue: "",
    hasLocalizedValue: "true",
  },
  constantValueEnabled: false,
};

type MigrationProps = { id: string } & Record<string, any>;

const addDirectoryCardDisplayProps = (
  props: MigrationProps
): MigrationProps => ({
  ...props,
  data: {
    ...props.data,
    linkOverride: {
      ...defaultLinkOverride,
      ...props.data?.linkOverride,
    },
    showAddress: props.data?.showAddress ?? true,
    showHoursStatus: props.data?.showHoursStatus ?? true,
    showPhoneNumbers: props.data?.showPhoneNumbers ?? true,
  },
});

export const directoryCardDisplayProps: Migration = {
  DirectoryGrid: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      data: {
        ...props.data,
        mappings: {
          ...props.data?.mappings,
          linkOverride: {
            ...defaultLinkOverride,
            ...props.data?.mappings?.linkOverride,
          },
          showAddress: props.data?.mappings?.showAddress ?? true,
          showHoursStatus: props.data?.mappings?.showHoursStatus ?? true,
          showPhoneNumbers: props.data?.mappings?.showPhoneNumbers ?? true,
        },
      },
    }),
  },
  DirectoryCard: {
    action: "updated",
    propTransformation: addDirectoryCardDisplayProps,
  },
};
