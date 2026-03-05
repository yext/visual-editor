// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../ve.ts";
import { defaultYetiFooterSignupSlotProps } from "./YetiFooterSignupSlot.tsx";
import {
  defaultYetiCompanyLinksColumnSlotProps,
  defaultYetiComplianceLinksColumnSlotProps,
  defaultYetiStoreLinksColumnSlotProps,
  defaultYetiSupportLinksColumnSlotProps,
} from "./YetiFooterLinksColumnSlot.tsx";
import { defaultYetiFooterSocialLinksSlotProps } from "./YetiFooterSocialLinksSlot.tsx";
import { defaultYetiFooterLegalSlotProps } from "./YetiFooterLegalSlot.tsx";

export interface YetiFooterLayoutSlotProps {
  styles: {
    showSignup: boolean;
    showSupportLinks: boolean;
    showCompanyLinks: boolean;
    showStoresLinks: boolean;
    showComplianceLinks: boolean;
    showSocial: boolean;
    showLegal: boolean;
  };
  slots: {
    SignupSlot: Slot;
    SupportLinksSlot: Slot;
    CompanyLinksSlot: Slot;
    StoresLinksSlot: Slot;
    ComplianceLinksSlot: Slot;
    SocialLinksSlot: Slot;
    LegalSlot: Slot;
  };
}

const fields: Fields<YetiFooterLayoutSlotProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      showSignup: YextField("Show Signup", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showSupportLinks: YextField("Show Support Links", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showCompanyLinks: YextField("Show Company Links", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showStoresLinks: YextField("Show Stores Links", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showComplianceLinks: YextField("Show Compliance Links", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showSocial: YextField("Show Social", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showLegal: YextField("Show Legal", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      SignupSlot: { type: "slot" },
      SupportLinksSlot: { type: "slot" },
      CompanyLinksSlot: { type: "slot" },
      StoresLinksSlot: { type: "slot" },
      ComplianceLinksSlot: { type: "slot" },
      SocialLinksSlot: { type: "slot" },
      LegalSlot: { type: "slot" },
    },
    visible: false,
  },
};

const YetiFooterLayoutSlotComponent: PuckComponent<
  YetiFooterLayoutSlotProps
> = ({ styles, slots }) => {
  return (
    <div className="flex w-full flex-col gap-6 overflow-hidden">
      {styles.showSignup ? (
        <div className="min-w-0">
          <slots.SignupSlot style={{ height: "auto" }} allow={[]} />
        </div>
      ) : null}
      {(styles.showSupportLinks ||
        styles.showCompanyLinks ||
        styles.showStoresLinks ||
        styles.showComplianceLinks) && (
        <div className="grid w-full gap-6 md:grid-cols-2 xl:grid-cols-4">
          {styles.showSupportLinks ? (
            <div className="min-w-0">
              <slots.SupportLinksSlot style={{ height: "auto" }} allow={[]} />
            </div>
          ) : null}
          {styles.showCompanyLinks ? (
            <div className="min-w-0">
              <slots.CompanyLinksSlot style={{ height: "auto" }} allow={[]} />
            </div>
          ) : null}
          {styles.showStoresLinks ? (
            <div className="min-w-0">
              <slots.StoresLinksSlot style={{ height: "auto" }} allow={[]} />
            </div>
          ) : null}
          {styles.showComplianceLinks ? (
            <div className="min-w-0">
              <slots.ComplianceLinksSlot
                style={{ height: "auto" }}
                allow={[]}
              />
            </div>
          ) : null}
        </div>
      )}
      {styles.showSocial ? (
        <div className="min-w-0">
          <slots.SocialLinksSlot style={{ height: "auto" }} allow={[]} />
        </div>
      ) : null}
      {styles.showLegal ? (
        <div className="min-w-0">
          <slots.LegalSlot style={{ height: "auto" }} allow={[]} />
        </div>
      ) : null}
    </div>
  );
};

export const defaultYetiFooterLayoutSlotProps: YetiFooterLayoutSlotProps = {
  styles: {
    showSignup: true,
    showSupportLinks: true,
    showCompanyLinks: true,
    showStoresLinks: true,
    showComplianceLinks: true,
    showSocial: true,
    showLegal: true,
  },
  slots: {
    SignupSlot: [
      {
        type: "YetiFooterSignupSlot",
        props: defaultYetiFooterSignupSlotProps,
      },
    ],
    SupportLinksSlot: [
      {
        type: "YetiFooterLinksColumnSlot",
        props: defaultYetiSupportLinksColumnSlotProps,
      },
    ],
    CompanyLinksSlot: [
      {
        type: "YetiFooterLinksColumnSlot",
        props: defaultYetiCompanyLinksColumnSlotProps,
      },
    ],
    StoresLinksSlot: [
      {
        type: "YetiFooterLinksColumnSlot",
        props: defaultYetiStoreLinksColumnSlotProps,
      },
    ],
    ComplianceLinksSlot: [
      {
        type: "YetiFooterLinksColumnSlot",
        props: defaultYetiComplianceLinksColumnSlotProps,
      },
    ],
    SocialLinksSlot: [
      {
        type: "YetiFooterSocialLinksSlot",
        props: defaultYetiFooterSocialLinksSlotProps,
      },
    ],
    LegalSlot: [
      {
        type: "YetiFooterLegalSlot",
        props: defaultYetiFooterLegalSlotProps,
      },
    ],
  },
};

export const YetiFooterLayoutSlot: ComponentConfig<{
  props: YetiFooterLayoutSlotProps;
}> = {
  label: "Yeti Footer Layout Slot",
  fields,
  defaultProps: defaultYetiFooterLayoutSlotProps,
  render: (props) => <YetiFooterLayoutSlotComponent {...props} />,
};
