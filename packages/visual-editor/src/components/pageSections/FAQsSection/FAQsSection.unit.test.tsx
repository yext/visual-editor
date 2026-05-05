import { describe, expect, it } from "vitest";
import { type ComponentData } from "@puckeditor/core";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";
import { FAQSection, type FAQSectionProps } from "./FAQsSection.tsx";

describe("FAQSection resolveData", () => {
  it("renders one faq per linked entity and maps question and answer fields", async () => {
    const data = {
      type: "FAQSection",
      props: JSON.parse(JSON.stringify(FAQSection.defaultProps)),
    } as ComponentData<FAQSectionProps>;

    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedLocation";
    data.props.faqs = {
      question: {
        field: "name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      answer: {
        field: "answer",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
    };

    const resolvedData = await FAQSection.resolveData!(data, {
      changed: {},
      fields: {},
      lastFields: null,
      lastData: null,
      metadata: {
        streamDocument: {
          c_linkedLocation: [
            { name: "Downtown", answer: getDefaultRTF("Open late") },
            { name: "Uptown", answer: getDefaultRTF("Open early") },
          ],
        },
      },
      parent: null,
      trigger: "initial",
    } as any);

    expect(resolvedData.props!.slots!.CardSlot).toHaveLength(2);
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.parentData).toEqual({
      field: "c_linkedLocation",
      faq: {
        question: "Downtown",
        answer: getDefaultRTF("Open late"),
      },
    });
    expect(resolvedData.props!.slots!.CardSlot[1]?.props.parentData).toEqual({
      field: "c_linkedLocation",
      faq: {
        question: "Uptown",
        answer: getDefaultRTF("Open early"),
      },
    });
  });

  it("resolves embedded fields in constant faq answers against each linked entity", async () => {
    const data = {
      type: "FAQSection",
      props: JSON.parse(JSON.stringify(FAQSection.defaultProps)),
    } as ComponentData<FAQSectionProps>;

    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedLocation";
    data.props.faqs = {
      question: {
        field: "name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      answer: {
        field: "",
        constantValue: getDefaultRTF("Potato: [[name]]"),
        constantValueEnabled: true,
      },
    };

    const resolvedData = await FAQSection.resolveData!(data, {
      changed: {},
      fields: {},
      lastFields: null,
      lastData: null,
      metadata: {
        streamDocument: {
          c_linkedLocation: [{ name: "Downtown" }],
        },
      },
      parent: null,
      trigger: "initial",
    } as any);

    expect(
      resolvedData.props!.slots!.CardSlot[0]?.props.parentData?.faq.answer
    ).toMatchObject({
      html: expect.stringContaining("Potato: Downtown"),
    });
  });

  it("resolves constant faq questions against each linked entity", async () => {
    const data = {
      type: "FAQSection",
      props: JSON.parse(JSON.stringify(FAQSection.defaultProps)),
    } as ComponentData<FAQSectionProps>;

    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedLocation";
    data.props.faqs = {
      question: {
        field: "",
        constantValue: { defaultValue: "Question: [[name]]" },
        constantValueEnabled: true,
      },
      answer: {
        field: "answer",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
    };

    const resolvedData = await FAQSection.resolveData!(data, {
      changed: {},
      fields: {},
      lastFields: null,
      lastData: null,
      metadata: {
        streamDocument: {
          c_linkedLocation: [
            { name: "Downtown", answer: getDefaultRTF("Fresh daily") },
          ],
        },
      },
      parent: null,
      trigger: "initial",
    } as any);

    expect(resolvedData.props!.slots!.CardSlot[0]?.props.parentData).toEqual({
      field: "c_linkedLocation",
      faq: {
        question: {
          defaultValue: "Question: Downtown",
        },
        answer: getDefaultRTF("Fresh daily"),
      },
    });
  });
});
