// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { YetiHeading } from "../atoms/YetiHeading.tsx";
import { YetiParagraph } from "../atoms/YetiParagraph.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiParkingSlotProps {
  data: {
    heading: TranslatableString;
    body: TranslatableString;
  };
}

const fields: Fields<YetiParkingSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField("Heading", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      body: YextField("Body", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
    },
  }),
};

const YetiParkingSlotComponent: PuckComponent<YetiParkingSlotProps> = ({
  data,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const heading = resolveComponentData(
    data.heading,
    i18n.language,
    streamDocument
  );
  const body = resolveComponentData(data.body, i18n.language, streamDocument);

  if (!heading && !body) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 text-[#0F3658]">
      {heading ? (
        <YetiHeading
          level={4}
          className="text-base font-black uppercase tracking-[0.08em]"
        >
          {heading}
        </YetiHeading>
      ) : null}
      {body ? (
        <YetiParagraph className="max-w-3xl text-sm leading-relaxed text-[#2F4358]">
          {body}
        </YetiParagraph>
      ) : null}
    </div>
  );
};

export const defaultYetiParkingSlotProps: YetiParkingSlotProps = {
  data: {
    heading: toTranslatableString("Parking"),
    body: toTranslatableString(
      "Park at a nearby garage or find street parking around the store."
    ),
  },
};

export const YetiParkingSlot: ComponentConfig<{ props: YetiParkingSlotProps }> =
  {
    label: "Yeti Parking Slot",
    fields,
    defaultProps: defaultYetiParkingSlotProps,
    render: (props) => <YetiParkingSlotComponent {...props} />,
  };
