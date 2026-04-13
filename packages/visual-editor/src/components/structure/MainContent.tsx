import { ComponentConfig, PuckComponent, Slot } from "@puckeditor/core";

export interface MainContentProps {
  content: Slot;
}

const MainContentComponent: PuckComponent<MainContentProps> = ({
  content: Content,
}) => {
  return (
    <main id="main-content">
      <Content disallow={["ExpandedHeader", "ExpandedFooter", "MainContent"]} />
    </main>
  );
};

export const MainContent: ComponentConfig<{ props: MainContentProps }> = {
  label: "Main Content",
  fields: {
    content: {
      type: "slot",
      allow: [],
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
