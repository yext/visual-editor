import { ComponentConfig, Fields } from "@measured/puck";

type LocatorProps = {
  text: string;
};

const fields: Fields<LocatorProps> = {
  text: {
    label: "Text",
    type: "text",
  },
};

const LocatorComponent: ComponentConfig<LocatorProps> = {
  fields,
  defaultProps: {
    text: "Some Placeholder",
  },
  label: "Locator",
  render: (props) => <Locator {...props} />,
};

const Locator: React.FC<LocatorProps> = ({ text }) => {
  return <div>{text}</div>;
};

export { type LocatorProps, LocatorComponent as Locator };
