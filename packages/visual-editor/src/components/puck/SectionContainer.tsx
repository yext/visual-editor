import * as React from "react";
import {
  PageSection,
  Heading,
  BackgroundStyle,
  YextEntityField,
  BasicSelector,
  YextEntityFieldSelector,
  ThemeOptions,
  resolveYextEntityField,
  HeadingProps,
  backgroundColors,
  OtherCategory,
  PageSectionCategory,
  useDocument,
} from "../../index.ts";
import {
  ComponentConfig,
  DropZone,
  Fields,
  WithId,
  WithPuckProps,
} from "@measured/puck";

export type SectionContainerProps = {
  background?: BackgroundStyle;
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingProps["level"];
  };
};

const sectionContainerFields: Fields<SectionContainerProps> = {
  background: BasicSelector("Background Color", ThemeOptions.BACKGROUND_COLOR),
  sectionHeading: {
    type: "object",
    label: "Section Heading",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Section Heading Text",
        filter: { types: ["type.string"] },
      }),
      level: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
    },
  },
};

const SectionContainerComponent = (
  props: WithId<WithPuckProps<SectionContainerProps>>
) => {
  const { background, sectionHeading } = props;
  const document = useDocument();

  const resolvedHeadingText = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );

  return (
    <PageSection background={background}>
      {resolvedHeadingText && (
        <Heading level={sectionHeading.level} className="pb-8">
          {resolvedHeadingText}
        </Heading>
      )}
      <DropZone
        zone="page-section"
        disallow={[...OtherCategory, ...PageSectionCategory]}
      />
    </PageSection>
  );
};

export const SectionContainer: ComponentConfig<SectionContainerProps> = {
  label: "Section Container",
  fields: sectionContainerFields,
  render: (props) => <SectionContainerComponent {...props} />,
  defaultProps: {
    background: backgroundColors.background1.value,
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Section",
        constantValueEnabled: true,
      },
      level: 2,
    },
  },
};
