import type { ComponentConfig, PuckComponent } from "@puckeditor/core";
import { msg } from "../utils/i18n/platform.ts";
import { YextPuckFields } from "./fields.ts";

export type MyComponentProps = {
  foo: string;
};

type MyComponentConfig = ComponentConfig<{
  props: MyComponentProps;
  fields: YextPuckFields; // registers custom field types
}>;

const myComponentFields: MyComponentConfig["fields"] = {
  foo: {
    type: "basicSelector",
    label: msg("tone", "Tone"),
    options: [
      { label: "Neutral", value: "neutral" },
      { label: "Bold", value: "bold" },
    ],
    disableSearch: false,
  },
};

const MyComponentWrapper: PuckComponent<MyComponentProps> = ({ foo }) => {
  return <div>{foo}</div>;
};

export const MyComponent: MyComponentConfig = {
  label: msg("components.myComponent", "My Component"),
  fields: myComponentFields,
  // resolveData: (data) => {...},
  render: (props) => <MyComponentWrapper {...props} />,
};
