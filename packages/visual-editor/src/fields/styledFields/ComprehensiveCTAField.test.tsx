import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const puckState = {
  appState: {
    ui: {
      itemSelector: null,
    },
  },
  getItemBySelector: () => undefined,
};

vi.mock("@puckeditor/core", async () => {
  const actual =
    await vi.importActual<typeof import("@puckeditor/core")>(
      "@puckeditor/core"
    );

  return {
    ...actual,
    createUsePuck: () => (selector: (state: typeof puckState) => unknown) =>
      selector(puckState),
  };
});

import { EntityFieldsContext } from "../../hooks/useEntityFields.tsx";
import { TemplatePropsContext } from "../../hooks/useDocument.tsx";
import { TemplateMetadataContext } from "../../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../../internal/types/templateMetadata.ts";
import { type StreamFields } from "../../types/entityFields.ts";
import { YextAutoField } from "../YextAutoField.tsx";
import {
  type ComprehensiveCTAField,
  type ComprehensiveCTAValue,
} from "./ComprehensiveCTAField.tsx";
import { type StyledButtonValue } from "./StyledButtonField.tsx";
import { type StyledLinkValue } from "./StyledLinkField.tsx";

const field: ComprehensiveCTAField = {
  type: "comprehensiveCTA",
  label: "Complete CTA",
};

const defaultEntityFields: StreamFields = {
  fields: [
    {
      name: "c_primaryCTA",
      definition: {
        name: "c_primaryCTA",
        typeName: "type.cta",
        type: {},
      },
    },
  ],
  displayNames: {
    c_primaryCTA: "Primary CTA",
  },
};

type ComprehensiveCTAValueOverrides = Omit<
  Partial<ComprehensiveCTAValue>,
  "data" | "styles"
> & {
  data?: Partial<ComprehensiveCTAValue["data"]>;
  styles?: Partial<Omit<ComprehensiveCTAValue["styles"], "button" | "link">> & {
    button?: Partial<StyledButtonValue>;
    link?: Partial<StyledLinkValue>;
  };
};

const defaultButtonStyles: StyledButtonValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
  borderRadius: "default",
  letterSpacing: "default",
};

const defaultLinkStyles: StyledLinkValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
  letterSpacing: "default",
  includeCaret: "default",
};

const comprehensiveCTAValue = (
  overrides: ComprehensiveCTAValueOverrides = {}
): ComprehensiveCTAValue => {
  const { styles: styleOverrides, ...restOverrides } = overrides;
  const {
    button: buttonOverrides,
    link: linkOverrides,
    ...otherStyleOverrides
  } = styleOverrides ?? {};

  return {
    data: {
      actionType: "link",
      cta: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          ctaType: "textAndLink",
          label: { defaultValue: "Learn More" },
          link: { defaultValue: "#" },
          linkType: "URL",
        },
        selectedType: "textAndLink",
      },
      openInNewTab: false,
      buttonText: { defaultValue: "Button" },
      customId: "",
      customClass: "",
      dataAttributes: [],
      ariaLabel: { defaultValue: "Button" },
      ...overrides.data,
    },
    styles: {
      variant: "primary",
      presetImage: "app-store",
      color: undefined,
      ...otherStyleOverrides,
      button: { ...defaultButtonStyles, ...buttonOverrides },
      link: { ...defaultLinkStyles, ...linkOverrides },
    },
    className: restOverrides.className,
    sx: restOverrides.sx,
    eventName: restOverrides.eventName,
  };
};

const renderField = (
  value: ComprehensiveCTAValue = comprehensiveCTAValue(),
  entityFields: StreamFields | null = defaultEntityFields
) => {
  const onChange = vi.fn();
  const templateMetadata = {
    ...generateTemplateMetadata(),
    entityTypeDisplayName: "Location",
  };

  render(
    <TemplatePropsContext.Provider value={{ document: { locale: "en" } }}>
      <TemplateMetadataContext.Provider value={templateMetadata}>
        <EntityFieldsContext.Provider value={entityFields}>
          <YextAutoField
            field={field}
            id="complete-cta"
            onChange={onChange}
            value={value}
          />
        </EntityFieldsContext.Provider>
      </TemplateMetadataContext.Provider>
    </TemplatePropsContext.Provider>
  );

  return { onChange };
};

describe("ComprehensiveCTAField", () => {
  it("renders through YextAutoField as a registered field type", () => {
    renderField();

    expect(screen.getByText("Complete CTA")).toBeDefined();
    expect(screen.getByText("Data")).toBeDefined();
    expect(screen.getByText("Styles")).toBeDefined();
    expect(screen.getByRole("combobox", { name: "CTA Type" })).toBeDefined();
    expect(screen.getByRole("combobox", { name: "Link Type" })).toBeDefined();
    expect(screen.getByText("Action Type")).toBeDefined();
    expect(screen.getByRole("radio", { name: "Button" })).toBeDefined();
    expect(screen.getByText("Button Styles")).toBeDefined();
    expect(screen.queryByText("Normalize Link")).toBeNull();
  });

  it("shows button-only fields when action type is button", () => {
    renderField(
      comprehensiveCTAValue({
        data: {
          actionType: "button",
          cta: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              ctaType: "textAndLink",
              label: { defaultValue: "Learn More" },
              link: { defaultValue: "#" },
              linkType: "URL",
            },
            selectedType: "textAndLink",
          },
          openInNewTab: false,
          buttonText: { defaultValue: "Button" },
          customId: "cta-id",
          customClass: "cta-class",
          dataAttributes: [],
          ariaLabel: { defaultValue: "Button Aria" },
        },
      })
    );

    expect(screen.queryByRole("combobox", { name: "CTA Type" })).toBeNull();
    expect(screen.getByDisplayValue("cta-id")).toBeDefined();
    expect(screen.getByDisplayValue("cta-class")).toBeDefined();
    expect(screen.getByDisplayValue("Button Aria")).toBeDefined();
    expect(screen.getByText("Button Styles")).toBeDefined();
  });

  it("shows preset image instead of variant for preset-image CTAs", () => {
    renderField(
      comprehensiveCTAValue({
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              ctaType: "presetImage",
              label: { defaultValue: "Download" },
              link: { defaultValue: "#" },
              linkType: "URL",
            },
            selectedType: "presetImage",
          },
          openInNewTab: false,
          buttonText: { defaultValue: "Button" },
          customId: "",
          customClass: "",
          dataAttributes: [],
          ariaLabel: { defaultValue: "Button" },
        },
      })
    );

    expect(
      screen.getByRole("combobox", { name: "Preset Image" })
    ).toBeDefined();
    expect(screen.queryByText("Button Styles")).toBeNull();
    expect(screen.queryByText("Link Styles")).toBeNull();
  });

  it("shows link style controls when variant is link", () => {
    renderField(
      comprehensiveCTAValue({
        styles: {
          variant: "link",
        },
      })
    );

    expect(screen.getByText("Link Styles")).toBeDefined();
    expect(screen.getByText("Include Caret")).toBeDefined();
    expect(screen.queryByText("Button Styles")).toBeNull();
  });

  it("updates nested button data while preserving styles", () => {
    const initialValue = comprehensiveCTAValue({
      data: {
        actionType: "button",
        cta: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            ctaType: "textAndLink",
            label: { defaultValue: "Learn More" },
            link: { defaultValue: "#" },
            linkType: "URL",
          },
          selectedType: "textAndLink",
        },
        openInNewTab: false,
        buttonText: { defaultValue: "Button" },
        customId: "old-id",
        customClass: "cta-class",
        dataAttributes: [],
        ariaLabel: { defaultValue: "Button Aria" },
      },
      styles: {
        variant: "secondary",
        presetImage: "app-store",
        button: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
          borderRadius: "default",
          letterSpacing: "default",
        },
        link: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
          letterSpacing: "default",
          includeCaret: "default",
        },
      },
    });
    const { onChange } = renderField(initialValue);

    fireEvent.change(screen.getByDisplayValue("old-id"), {
      target: { value: "new-id" },
    });

    expect(onChange).toHaveBeenCalledWith(
      {
        ...initialValue,
        data: {
          ...initialValue.data,
          customId: "new-id",
        },
      },
      undefined
    );
  });
});
