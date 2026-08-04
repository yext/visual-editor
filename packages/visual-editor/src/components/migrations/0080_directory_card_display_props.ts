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
    showPhoneNumber: props.data?.showPhoneNumber ?? true,
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
          showPhoneNumber: props.data?.mappings?.showPhoneNumber ?? true,
        },
      },
    }),
  },
  DirectoryCard: {
    action: "updated",
    propTransformation: addDirectoryCardDisplayProps,
  },
};
