import type { PuckComponent } from "@puckeditor/core";
import { msg } from "../utils/i18n/platform.ts";
import { YextComponentConfig, YextFields } from "./fields.ts";

export type MyComponentProps = {
  foo: string;
};

const myComponentFields: YextFields<MyComponentProps> = {
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

export const MyComponent: YextComponentConfig<MyComponentProps> = {
  label: msg("components.myComponent", "My Component"),
  fields: myComponentFields,
  // resolveData: (data) => {...},
  render: (props) => <MyComponentWrapper {...props} />,
};
