import { Migration } from "../../utils/migrate.ts";

// Ensures currentPage defaults to the 'name' field if no constantValue is present.
const transformBreadcrumbProps = (props: any) => {
  const data = props.data ?? {};

  // If constantValue is already set, don't override it
  if (data.currentPage?.constantValue) {
    return props;
  }

  return {
    ...props,
    data: {
      ...data,
      currentPage: {
        constantValue: { defaultValue: "[[name]]" },
        field: "name",
        constantValueEnabled: false,
      },
    },
    styles: {
      ...props.styles,
      showCurrentPage: true,
    },
  };
};

export const directoryBreadcrumbCurrentPage: Migration = {
  BreadcrumbsSection: {
    action: "updated",
    propTransformation: transformBreadcrumbProps,
  },
  BreadcrumbsSlot: {
    action: "updated",
    propTransformation: transformBreadcrumbProps,
  },
};
