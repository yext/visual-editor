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

export interface YetiFooterSignupSlotProps {
  data: {
    heading: TranslatableString;
    body: TranslatableString;
    inputPlaceholder: TranslatableString;
    actionText: TranslatableString;
    actionHref: string;
    disclaimer: TranslatableString;
  };
}

const fields: Fields<YetiFooterSignupSlotProps> = {
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
      inputPlaceholder: YextField("Input Placeholder", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      actionText: YextField("Action Text", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      actionHref: YextField("Action Href", { type: "text" }),
      disclaimer: YextField("Disclaimer", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
    },
  }),
};

const YetiFooterSignupSlotComponent: PuckComponent<
  YetiFooterSignupSlotProps
> = ({ data }) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const heading = resolveComponentData(
    data.heading,
    i18n.language,
    streamDocument
  );
  const body = resolveComponentData(data.body, i18n.language, streamDocument);
  const inputPlaceholder = resolveComponentData(
    data.inputPlaceholder,
    i18n.language,
    streamDocument
  );
  const actionText = resolveComponentData(
    data.actionText,
    i18n.language,
    streamDocument
  );
  const disclaimer = resolveComponentData(
    data.disclaimer,
    i18n.language,
    streamDocument
  );

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {heading ? <YetiHeading level={3}>{heading}</YetiHeading> : null}
      {body ? (
        <YetiParagraph className="text-sm leading-relaxed">
          {body}
        </YetiParagraph>
      ) : null}
      <div className="flex w-full min-w-0 items-center gap-2">
        <input
          className="h-10 min-w-0 flex-1 border border-current/40 bg-transparent px-3 text-sm placeholder:opacity-80"
          placeholder={
            typeof inputPlaceholder === "string" ? inputPlaceholder : "Email"
          }
          aria-label={
            typeof inputPlaceholder === "string" ? inputPlaceholder : "Email"
          }
          readOnly
        />
        {actionText ? (
          <a
            href={data.actionHref || "#"}
            className="inline-flex h-10 items-center border border-current px-4 text-sm font-semibold uppercase"
          >
            {actionText}
          </a>
        ) : null}
      </div>
      {disclaimer ? (
        <YetiParagraph className="text-xs leading-relaxed opacity-80">
          {disclaimer}
        </YetiParagraph>
      ) : null}
    </div>
  );
};

export const defaultYetiFooterSignupSlotProps: YetiFooterSignupSlotProps = {
  data: {
    heading: toTranslatableString("Sign Me Up"),
    body: toTranslatableString(
      "Be the first to know about new products, films, and events."
    ),
    inputPlaceholder: toTranslatableString("Enter Your Email"),
    actionText: toTranslatableString("Join"),
    actionHref: "https://www.yeti.com/",
    disclaimer: toTranslatableString(
      "By entering your email address you agree to receive marketing messages from YETI."
    ),
  },
};

export const YetiFooterSignupSlot: ComponentConfig<{
  props: YetiFooterSignupSlotProps;
}> = {
  label: "Yeti Footer Signup Slot",
  fields,
  defaultProps: defaultYetiFooterSignupSlotProps,
  render: (props) => <YetiFooterSignupSlotComponent {...props} />,
};
