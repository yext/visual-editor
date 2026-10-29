import { z } from "zod";
import { PuckComponent, Slot } from "@puckeditor/core";
import { YextComponentConfig } from "../../fields/fields.ts";

/** Components that cannot be placed directly in the main page content. */
export const mainContentDisallowedComponents = [
  "Address",
  "BodyText",
  "CTAGroup",
  "CTAWrapper",
  "Emails",
  "GetDirections",
  "HeadingText",
  "HoursTable",
  "HoursStatus",
  "ImageWrapper",
  "MapboxStaticMap",
  "Phone",
  "TextList",
  "Text",
  "ExpandedHeader",
  "ExpandedFooter",
  "Header",
  "Footer",
  "MainContent",
];

export interface MainContentProps {
  content: Slot;
}

const MainContentComponent: PuckComponent<MainContentProps> = ({
  content: Content,
  puck,
}) => {
  return (
    <main
      id="main-content"
      style={{
        minHeight: puck.isEditing ? "400px" : undefined,
      }}
    >
      {/* Puck replaces the slot callback when children change. Invoke it as a
          render callback so React retains the underlying section tree. */}
      {Content({
        disallow: mainContentDisallowedComponents,
      })}
    </main>
  );
};

export const MainContent: YextComponentConfig<MainContentProps> = {
  label: "Main Content",
  layoutGenerationMetadata: {
    props: z.object({ content: z.array(z.unknown()) }),
  },
  fields: {
    content: {
      type: "slot",
      disallow: mainContentDisallowedComponents,
      visible: false,
    },
  },
  defaultProps: {
    content: [],
  },
  permissions: {
    delete: false,
    drag: false,
    duplicate: false,
  },
  render: (props) => <MainContentComponent {...props} />,
};
