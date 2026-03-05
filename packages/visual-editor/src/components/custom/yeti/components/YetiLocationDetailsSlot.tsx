// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Address as RenderAddress,
  AddressType,
  getDirections,
} from "@yext/pages-components";
import {
  EntityField,
  TranslatableString,
  YextEntityField,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { YetiHeading } from "../atoms/YetiHeading.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiLocationDetailsSlotProps {
  data: {
    title: TranslatableString;
    address: YextEntityField<AddressType>;
    phone: YextEntityField<string>;
    primaryActionText: TranslatableString;
    secondaryActionText: TranslatableString;
  };
  styles: {
    showPrimaryAction: boolean;
    showSecondaryAction: boolean;
  };
}

const fields: Fields<YetiLocationDetailsSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      title: YextField("Title", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      address: YextField("Address", {
        type: "entityField",
        filter: { types: ["type.address"] },
      }),
      phone: YextField("Phone", {
        type: "entityField",
        filter: { types: ["type.phone"] },
      }),
      primaryActionText: YextField("Primary Action Text", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      secondaryActionText: YextField("Secondary Action Text", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      showPrimaryAction: YextField("Show Primary Action", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showSecondaryAction: YextField("Show Secondary Action", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
};

const YetiLocationDetailsSlotComponent: PuckComponent<
  YetiLocationDetailsSlotProps
> = ({ data, styles, puck }) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const title = resolveComponentData(data.title, i18n.language, streamDocument);
  const address = resolveComponentData(
    data.address,
    i18n.language,
    streamDocument
  ) as AddressType | undefined;
  const phone = resolveComponentData(data.phone, i18n.language, streamDocument);
  const primaryActionText = resolveComponentData(
    data.primaryActionText,
    i18n.language,
    streamDocument
  );
  const secondaryActionText = resolveComponentData(
    data.secondaryActionText,
    i18n.language,
    streamDocument
  );

  const hasAddress = Boolean(
    address?.line1 ||
      address?.line2 ||
      address?.city ||
      address?.region ||
      address?.postalCode
  );
  const directionsLink = hasAddress
    ? getDirections(address, undefined, undefined, { provider: "google" })
    : undefined;

  if (!hasAddress && !phone) {
    return puck.isEditing ? <div className="min-h-[120px]" /> : null;
  }

  return (
    <div className="flex flex-col gap-4 text-sm text-[#0F3658]">
      {title ? (
        <YetiHeading
          level={4}
          className="text-base font-black uppercase tracking-[0.08em]"
        >
          {title}
        </YetiHeading>
      ) : null}
      {hasAddress ? (
        <EntityField
          displayName="Address"
          fieldId={data.address.field}
          constantValueEnabled={data.address.constantValueEnabled}
        >
          <div className="leading-relaxed">
            <RenderAddress address={address} />
          </div>
        </EntityField>
      ) : null}
      {phone ? (
        <EntityField
          displayName="Phone"
          fieldId={data.phone.field}
          constantValueEnabled={data.phone.constantValueEnabled}
        >
          <a
            href={`tel:${String(phone).replace(/[^+\d]/g, "")}`}
            className="font-semibold"
          >
            {phone}
          </a>
        </EntityField>
      ) : null}
      <div className="flex flex-wrap gap-4">
        {styles.showPrimaryAction && primaryActionText && directionsLink ? (
          <a
            href={directionsLink}
            className="inline-flex items-center border border-current px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
            target="_blank"
            rel="noreferrer"
          >
            {primaryActionText}
          </a>
        ) : null}
        {styles.showSecondaryAction && secondaryActionText && phone ? (
          <a
            href={`tel:${String(phone).replace(/[^+\d]/g, "")}`}
            className="inline-flex items-center border border-current px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
          >
            {secondaryActionText}
          </a>
        ) : null}
      </div>
    </div>
  );
};

export const defaultYetiLocationDetailsSlotProps: YetiLocationDetailsSlotProps =
  {
    data: {
      title: toTranslatableString("Location"),
      address: {
        field: "address",
        constantValue: {
          line1: "",
          city: "",
          region: "",
          postalCode: "",
          countryCode: "US",
        },
        constantValueEnabled: false,
      },
      phone: {
        field: "mainPhone",
        constantValue: "",
        constantValueEnabled: false,
      },
      primaryActionText: toTranslatableString("Get Directions"),
      secondaryActionText: toTranslatableString("Call Us"),
    },
    styles: {
      showPrimaryAction: true,
      showSecondaryAction: true,
    },
  };

export const YetiLocationDetailsSlot: ComponentConfig<{
  props: YetiLocationDetailsSlotProps;
}> = {
  label: "Yeti Location Details Slot",
  fields,
  defaultProps: defaultYetiLocationDetailsSlotProps,
  render: (props) => <YetiLocationDetailsSlotComponent {...props} />,
};
