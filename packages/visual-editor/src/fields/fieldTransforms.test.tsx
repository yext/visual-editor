import React from "react";
import { I18nextProvider } from "react-i18next";
import {
  i18nPageInstance,
  VISUAL_EDITOR_NAMESPACE,
} from "../utils/i18n/i18nInstances.ts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { YextCTAField } from "./CTASelectorField.tsx";
import type { MultiSelectorValue } from "./MultiSelectorField.tsx";
import type { TranslatableAssetImage } from "../types/images.ts";
import type {
  RichText,
  TranslatableRichText,
  TranslatableString,
} from "../types/types.ts";
import type { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import { createYextFieldTransforms } from "./fieldTransforms/index.ts";
import { ComprehensiveCTA } from "../components/helpers/ComprehensiveCTA.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { createItemSource } from "../utils/itemSource/createItemSource.ts";
import type { ComprehensiveCTAValue } from "./styledFields/ComprehensiveCTAField.tsx";
import type { AssetVideo } from "../types/videos.ts";
import { MaybeRTF } from "../components/helpers/index.ts";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFieldMap,
  type YextTransformedProps,
  type ResolvedComprehensiveCTAValue,
} from "./fields.ts";

describe("field transforms", () => {
  it.each([
    {
      name: "when a KG field is selected then its value is resolved",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      value: { field: "name", constantValue: "Unused" },
      expected: "Restaurant",
    },
    {
      name: "when a selected constant is unset then its value is undefined",
      field: { type: "entityField", transform: true, filter: {} },
      value: {
        field: "name",
        constantValueEnabled: true,
        constantValue: undefined,
      },
      expected: undefined,
    },
    {
      name: "when no entity source is selected then its value is undefined",
      field: { type: "entityField", transform: true, filter: {} },
      value: {
        field: "",
        constantValueEnabled: false,
        constantValue: "Unused",
      },
      expected: undefined,
    },
    {
      name: "when a linked field is selected then its value is resolved",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      value: { field: "linked.name", constantValue: "" },
      expected: "Linked Restaurant",
    },
    {
      name: "when a constant is selected then it is localized and interpolated",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      value: {
        field: "name",
        constantValueEnabled: true,
        constantValue: { defaultValue: "Welcome", es: "Hola [[name]]" },
      },
      expected: "Hola Restaurant",
    },
    {
      name: "when a string is translatable then its locale is selected",
      field: { type: "translatableString", transform: true },
      value: { defaultValue: "Welcome", es: "Hola [[name]]" },
      expected: "Hola Restaurant",
    },
    {
      name: "when a locale is absent then the default text is used",
      field: { type: "translatableString", transform: true },
      value: { defaultValue: "Welcome [[name]]" },
      expected: "Welcome Restaurant",
    },
    {
      name: "when localized text is empty then it stays empty",
      field: { type: "translatableString", transform: true },
      value: { defaultValue: "Welcome", es: "" },
      expected: "",
    },
    {
      name: "when a field is missing then its value is undefined",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      value: { field: "missing", constantValue: "Unused" },
      expected: undefined,
    },
    {
      name: "when a numeric field is zero then zero is preserved",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.number"] },
      },
      value: { field: "count", constantValue: 99 },
      expected: 0,
    },
    {
      name: "when an asset image opts in then its image and alt text are localized",
      field: { type: "image", transform: true },
      value: {
        hasLocalizedValue: "true",
        defaultValue: { url: "/default.jpg", alternateText: "Default" },
        es: {
          url: "/es.jpg",
          height: 200,
          width: 400,
          alternateText: { defaultValue: "Image", es: "Foto de [[name]]" },
          assetImage: {
            sourceUrl: "/original.jpg",
            transformations: { ROTATION: { degree: 90 } },
          },
        },
      },
      expected: {
        url: "/es.jpg",
        height: 200,
        width: 400,
        alternateText: "Foto de Restaurant",
        assetImage: {
          sourceUrl: "/original.jpg",
          transformations: { ROTATION: { degree: 90 } },
        },
      },
    },
    {
      name: "when a multi-selector opts in then selected values preserve zero and false",
      field: { type: "multiSelector", transform: true },
      value: {
        selections: [
          { value: "menu" },
          { value: undefined },
          { value: 0 },
          { value: false },
        ],
      },
      expected: ["menu", 0, false],
    },
    {
      name: "when a multi-selector is empty then its resolved list is empty",
      field: { type: "multiSelector", transform: true },
      value: undefined,
      expected: [],
    },
    {
      name: "when an optional number is zero then zero is preserved",
      field: { type: "optionalNumber", transform: true },
      value: 0,
      expected: 0,
    },
    {
      name: "when an optional number is hidden then its resolved value is undefined",
      field: { type: "optionalNumber", transform: true },
      value: "__ve_optionalNumber_hide__",
      expected: undefined,
    },
    {
      name: "when a constant CTA opts in then its label and link are resolved",
      field: { type: "ctaSelector", transform: true },
      value: {
        constantValueEnabled: true,
        constantValue: {
          ctaType: "textAndLink",
          label: { defaultValue: "Order", es: "Pedir [[name]]" },
          link: { defaultValue: "/en", es: "/es" },
          linkType: "URL",
          openInNewTab: true,
        },
      },
      expected: {
        ctaType: "textAndLink",
        label: "Pedir Restaurant",
        link: "/es",
        linkType: "URL",
        openInNewTab: true,
      },
    },
    {
      name: "when a KG CTA opts in then its source and selected mode are resolved",
      field: { type: "ctaSelector", transform: true },
      value: {
        field: "orderCta",
        selectedType: "presetImage",
        constantValue: { label: "Unused", link: "/unused" },
      },
      expected: {
        label: "Pedir Restaurant",
        link: "/order",
        ctaType: "presetImage",
      },
    },
    {
      name: "when a selected CTA source is missing then its value is undefined",
      field: { type: "ctaSelector", transform: true },
      value: {
        field: "missing",
        constantValue: { label: "Unused", link: "/unused" },
      },
      expected: undefined,
    },
    {
      name: "when a text list opts in then each item is localized and interpolated",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"], includeListsOnly: true },
      },
      value: {
        field: "",
        constantValueEnabled: true,
        constantValue: [
          { defaultValue: "Dine-in", es: "Mesa en [[name]]" },
          { defaultValue: "Delivery" },
        ],
      },
      expected: ["Mesa en Restaurant", "Delivery"],
    },
    {
      name: "when rich text is localized then resolved HTML and JSON are returned",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.rich_text_v2"] },
      },
      value: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          defaultValue: { html: "<p>Welcome</p>", json: '{"text":"Welcome"}' },
          es: {
            html: "<p>Hola [[name]]</p>",
            json: '{"text":"Hola [[name]]"}',
          },
        },
      },
      expected: {
        html: "<p>Hola Restaurant</p>",
        json: '{"text":"Hola Restaurant"}',
      },
    },
    {
      name: "when a rich-text list is selected then its resolved objects are returned",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.rich_text_v2"], includeListsOnly: true },
      },
      value: {
        field: "",
        constantValueEnabled: true,
        constantValue: [
          {
            defaultValue: { html: "<p>Hello</p>" },
            es: { html: "<p>Hola [[name]]</p>" },
          },
        ],
      },
      expected: [{ html: "<p>Hola Restaurant</p>" }],
    },
  ])("$name", ({ field, value, expected }) => {
    const authoredValue = structuredClone(value);
    expect(
      createYextFieldTransforms(
        {
          name: "Restaurant",
          linked: [{ name: "Linked Restaurant" }],
          count: 0,
          orderCta: {
            label: { defaultValue: "Order", es: "Pedir [[name]]" },
            link: "/order",
          },
        },
        "es"
      ).custom({
        field,
        value,
        componentId: "hero",
        propName: "title",
        propPath: "title",
        isReadOnly: false,
      })
    ).toEqual(expected);
    expect(value).toEqual(authoredValue);
  });

  it("when Get Directions opts in then its URL and translated label are usable without a renderer", () => {
    i18nPageInstance.addResourceBundle("es", VISUAL_EDITOR_NAMESPACE, {
      getDirections: "Cómo llegar",
    });
    const value = { field: "", selectedType: "getDirections" };
    const authoredValue = structuredClone(value);
    try {
      const resolved = createYextFieldTransforms(
        { yextDisplayCoordinate: { latitude: 30.2672, longitude: -97.7431 } },
        "es"
      ).custom({
        field: {
          type: "custom",
          metadata: { yextField: { type: "ctaSelector", transform: true } },
        },
        value,
        componentId: "hero",
        propName: "primaryCta",
        propPath: "primaryCta",
        isReadOnly: true,
      });
      expect(resolved).toMatchObject({
        ctaType: "getDirections",
        label: "Cómo llegar",
        linkType: "DRIVING_DIRECTIONS",
      });
      expect(resolved.link).toContain("30.2672");
      expect(resolved.link).toContain("-97.7431");
      expect(value).toEqual(authoredValue);
    } finally {
      i18nPageInstance.removeResourceBundle("es", VISUAL_EDITOR_NAMESPACE);
    }
  });

  it.each([
    "image",
    "multiSelector",
    "optionalNumber",
    "ctaSelector",
    "comprehensiveCTA",
    "video",
  ])(
    "when %s does not opt in then its authored value retains its identity",
    (type) => {
      for (const transform of [undefined, false]) {
        const value = {
          defaultValue: "Authored",
          selections: [{ value: "menu" }],
          constantValue: { label: "Order", link: "/order" },
        };
        expect(
          createYextFieldTransforms({}, "en").custom({
            field: {
              type: "custom",
              metadata: { yextField: { type, transform } },
            },
            value,
            componentId: "hero",
            propName: "value",
            propPath: "value",
            isReadOnly: true,
          })
        ).toBe(value);
      }
    }
  );

  it.each([undefined, false])(
    "when transform is %s then authored values retain their identity",
    (transform) => {
      const value = { field: "name", constantValue: { defaultValue: "Title" } };
      expect(
        createYextFieldTransforms({ name: "Restaurant" }, "en").entityField({
          field: toPuckFields({
            title: {
              type: "entityField",
              transform,
              filter: { types: ["type.string"] },
            },
          }).title!,
          value,
          componentId: "hero",
          propName: "title",
          propPath: "title",
          isReadOnly: false,
        })
      ).toBe(value);
    }
  );

  it.each([
    {
      name: "rich text",
      value: { defaultValue: { html: "<p>Hello [[name]]</p>", json: "{}" } },
      expected: { html: "<p>Hello Restaurant</p>", json: "{}" },
      expectedText: "Hello Restaurant",
    },
    {
      name: "a plain string",
      value: { defaultValue: "Hello [[name]]" },
      expected: "Hello Restaurant",
      expectedText: "Hello Restaurant",
    },
    {
      name: "empty content",
      value: undefined,
      expected: undefined,
      expectedText: "",
    },
  ])(
    "when a rich-text field contains $name then it returns resolved data for the shared renderer",
    ({ value, expected, expectedText }) => {
      const data = createYextFieldTransforms(
        { name: "Restaurant" },
        "en"
      ).entityField({
        field: toPuckFields({
          description: {
            type: "entityField",
            transform: true,
            filter: { types: ["type.string", "type.rich_text_v2"] },
          },
        }).description!,
        value: { field: "", constantValue: value, constantValueEnabled: true },
        componentId: "hero",
        propName: "description",
        propPath: "description",
        isReadOnly: true,
      });
      expect(data).toEqual(expected);
      const html = renderToStaticMarkup(
        <MaybeRTF data={data} bodyVariant="lg" className="hero-description" />
      );
      expect(html).toContain(expectedText);
      if (expectedText) {
        expect(html).toContain("hero-description");
      } else {
        expect(html).toBe("");
      }
    }
  );

  it("when a localized image is selected then complex shape and asset metadata are retained", () => {
    const value = {
      field: "",
      constantValueEnabled: true,
      constantValue: {
        defaultValue: { image: { url: "/default.jpg" } },
        es: {
          image: {
            url: "/hero.jpg",
            width: 640,
            height: 360,
            alternateText: { defaultValue: "Image", es: "[[name]]" },
            assetImage: {
              sourceUrl: "/original.jpg",
              transformations: { ROTATION: { degree: 90 } },
            },
          },
        },
      },
    };
    const authoredValue = structuredClone(value);
    expect(
      createYextFieldTransforms({ name: "Restaurant" }, "es").entityField({
        field: toPuckFields({
          image: {
            type: "entityField",
            transform: true,
            filter: { types: ["type.image"] },
          },
        }).image!,
        value,
        componentId: "hero",
        propName: "image",
        propPath: "image",
        isReadOnly: true,
      })
    ).toEqual({
      image: { ...value.constantValue.es.image, alternateText: "Restaurant" },
    });
    expect(value).toEqual(authoredValue);
  });

  it("when fields opt in then their config derives render types while retaining authored defaults", () => {
    const fields = {
      title: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      description: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string", "type.rich_text_v2"] },
      },
      image: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.image"] },
      },
      label: { type: "translatableString", transform: true },
      untouched: { type: "entityField", filter: { types: ["type.string"] } },
    } satisfies YextFieldMap<{
      title: YextEntityField<TranslatableString>;
      description: YextEntityField<TranslatableRichText>;
      image: YextEntityField<TranslatableAssetImage>;
      label: TranslatableString;
      untouched: YextEntityField<TranslatableString>;
    }>;
    const config: YextComponentConfig<
      {
        title: YextEntityField<TranslatableString>;
        description: YextEntityField<TranslatableRichText>;
        image: YextEntityField<TranslatableAssetImage>;
        label: TranslatableString;
        untouched: YextEntityField<TranslatableString>;
      },
      typeof fields
    > = {
      fields,
      render: ({ title, description, image, label, untouched }) => {
        expectTypeOf(title).toEqualTypeOf<string | undefined>();
        expectTypeOf(description).toEqualTypeOf<
          RichText | string | undefined
        >();
        expectTypeOf(image?.alternateText).toEqualTypeOf<string | undefined>();
        expectTypeOf(label).toEqualTypeOf<string>();
        expectTypeOf(untouched).toMatchTypeOf<
          YextEntityField<TranslatableString>
        >();
        return <MaybeRTF data={description} />;
      },
    };
    expect(toPuckFields(config.fields!).description.metadata?.yextField).toBe(
      fields.description
    );
  });
  it("when the new field types opt in then component render props use resolved data types", () => {
    type Props = {
      asset: TranslatableAssetImage;
      selections: MultiSelectorValue<string | number | boolean>;
      amount: number | string | null | undefined;
      cta: YextCTAField;
    };
    const fields = {
      asset: { type: "image", transform: true },
      selections: {
        type: "multiSelector",
        transform: true,
        label: "Selections",
        dropdownLabel: "Selection",
        options: [],
      },
      amount: {
        type: "optionalNumber",
        transform: true,
        showNumberFieldRadioLabel: "Show",
        hideNumberFieldRadioLabel: "Hide",
        defaultCustomValue: 1,
      },
      cta: { type: "ctaSelector", transform: true },
    } satisfies YextFieldMap<Props>;
    const config: YextComponentConfig<Props, typeof fields> = {
      fields,
      render: ({ asset, selections, amount, cta }) => {
        expectTypeOf(asset?.alternateText).toEqualTypeOf<string | undefined>();
        expectTypeOf(selections).toEqualTypeOf<(string | number | boolean)[]>();
        expectTypeOf(amount).toEqualTypeOf<number | undefined>();
        expectTypeOf(cta?.label).toEqualTypeOf<string | undefined>();
        expectTypeOf(cta?.link).toEqualTypeOf<string | undefined>();
        return <></>;
      },
    };
    expect(toPuckFields(config.fields!).cta.metadata?.yextField).toBe(
      fields.cta
    );
  });
  it.each([
    {
      name: "linked items",
      value: {
        field: "articles",
        constantValue: [],
        mappings: {
          title: { field: "name" },
          description: { field: "description", constantValue: "" },
          nested: {
            label: {
              field: "",
              constantValueEnabled: true,
              constantValue: {
                defaultValue: "Welcome [[name]]",
                es: "Hola [[name]]",
              },
            },
          },
        },
      },
      expected: [
        {
          title: "Artículo",
          description: { html: "<p>Leer Artículo</p>" },
          nested: { label: "Hola Artículo" },
        },
      ],
    },
    {
      name: "manual items",
      value: {
        field: "articles",
        constantValueEnabled: true,
        constantValue: [
          {
            title: {
              field: "",
              constantValueEnabled: true,
              constantValue: { defaultValue: "Manual", es: "Manual [[name]]" },
            },
            description: {
              field: "",
              constantValueEnabled: true,
              constantValue: { defaultValue: { html: "<p>Read [[name]]</p>" } },
            },
            nested: {
              label: {
                field: "",
                constantValueEnabled: true,
                constantValue: "[[name]]",
              },
            },
          },
        ],
      },
      expected: [
        {
          title: "Manual Restaurant",
          description: { html: "<p>Read Restaurant</p>" },
          nested: { label: "Restaurant" },
        },
      ],
    },
    {
      name: "missing linked items",
      value: { field: "missing", constantValue: [] },
      expected: [],
    },
    { name: "unset items", value: undefined, expected: [] },
  ])(
    "when a repeated source contains $name then its item props are resolved",
    ({ value, expected }) => {
      const source = createItemSource({
        label: "Articles",
        mappingFields: {
          title: { type: "entityField", filter: { types: ["type.string"] } },
          description: {
            type: "entityField",
            filter: { types: ["type.rich_text_v2"] },
          },
          nested: {
            type: "object",
            objectFields: {
              label: {
                type: "entityField",
                filter: { types: ["type.string"] },
              },
            },
          },
        },
      });
      const authored = structuredClone(value);
      expect(
        createYextFieldTransforms(
          {
            name: "Restaurant",
            articles: [
              {
                name: "Artículo",
                description: { html: "<p>Leer [[name]]</p>" },
              },
            ],
          },
          "es"
        ).custom({
          field: toPuckFields({
            articles: { ...source.field, transform: true },
          }).articles!,
          value,
          componentId: "cards",
          propName: "articles",
          propPath: "articles",
          isReadOnly: true,
        })
      ).toEqual(expected);
      expect(value).toEqual(authored);
    }
  );

  it.each(["link", "button"] as const)(
    "when a comprehensive CTA is a %s then it returns resolved data for presentation",
    (actionType) => {
      const value = {
        data: {
          actionType,
          cta: {
            field: "order",
            constantValue: undefined,
            constantValueEnabled: false,
            selectedType: "textAndLink",
          },
          buttonText: { defaultValue: "Book", es: "Reservar [[name]]" },
          ariaLabel: {
            defaultValue: "Book a table",
            es: "Reservar en [[name]]",
          },
          customId: "booking",
          customClass: "booking-button",
          dataAttributes: [{ key: "booking", value: "table" }],
          openInNewTab: true,
        },
        styles: { variant: "primary", button: { fontWeight: "700" } },
        eventName: "booking-click",
      };
      const authored = structuredClone(value);
      const resolved = createYextFieldTransforms(
        {
          name: "Restaurant",
          order: {
            label: { defaultValue: "Order", es: "Pedir [[name]]" },
            link: "/order",
            linkType: "URL",
          },
        },
        "es"
      ).custom({
        field: toPuckFields({
          cta: { type: "comprehensiveCTA", transform: true },
        }).cta!,
        value,
        componentId: "hero",
        propName: "cta",
        propPath: "cta",
        isReadOnly: true,
      });
      expect(resolved.data).toEqual({
        ...value.data,
        cta:
          actionType === "link"
            ? {
                ctaType: "textAndLink",
                label: "Pedir Restaurant",
                link: "/order",
                linkType: "URL",
              }
            : undefined,
        buttonText: "Reservar Restaurant",
        ariaLabel: "Reservar en Restaurant",
      });
      expect(resolved.styles.button.fontWeight).toBe("700");
      expect(value).toEqual(authored);
      const html = renderToStaticMarkup(
        <TemplatePropsContext.Provider value={{ document: {} }}>
          <ComprehensiveCTA value={resolved} />
        </TemplatePropsContext.Provider>
      );
      expect(html).toContain(
        actionType === "link" ? "Pedir Restaurant" : "Reservar Restaurant"
      );
      expect(html).toContain("font-weight:700");
      if (actionType === "button") {
        expect(html).toContain('id="booking"');
        expect(html).toContain('data-booking="table"');
        expect(html).toContain('aria-label="Reservar en Restaurant"');
      } else {
        expect(html).toContain('href="/order"');
        expect(html).toContain('target="_blank"');
      }
    }
  );

  it("when a video opts in then its text is interpolated and asset metadata stays intact", () => {
    const value = {
      id: "asset",
      name: "Video [[name]]",
      video: {
        id: "youtube",
        title: "Welcome [[name]]",
        url: "/watch",
        embeddedUrl: "/embed",
        duration: "PT30S",
        thumbnail: "/thumb.jpg",
      },
      videoDescription: "Visit [[name]]",
    };
    const authored = structuredClone(value);
    expect(
      createYextFieldTransforms({ name: "Restaurant" }, "en").custom({
        field: toPuckFields({ video: { type: "video", transform: true } })
          .video!,
        value,
        componentId: "hero",
        propName: "video",
        propPath: "video",
        isReadOnly: true,
      })
    ).toEqual({
      ...value,
      name: "Video Restaurant",
      video: { ...value.video, title: "Welcome Restaurant" },
      videoDescription: "Visit Restaurant",
    });
    expect(value).toEqual(authored);
    expectTypeOf<
      YextTransformedProps<
        { cta: ComprehensiveCTAValue; video: AssetVideo },
        {
          cta: { type: "comprehensiveCTA"; transform: true };
          video: { type: "video"; transform: true };
        }
      >["cta"]
    >().toEqualTypeOf<ResolvedComprehensiveCTAValue>();
  });

  it("when a repeated source opts in then inferred item props contain resolved values", () => {
    const source = createItemSource<{
      title: YextEntityField<TranslatableString>;
      nested: { description: YextEntityField<TranslatableRichText> };
    }>({
      label: "Cards",
      mappingFields: {
        title: { type: "entityField", filter: { types: ["type.string"] } },
        nested: {
          type: "object",
          objectFields: {
            description: {
              type: "entityField",
              filter: { types: ["type.rich_text_v2"] },
            },
          },
        },
      },
    });
    type Items = YextTransformedProps<
      { cards: typeof source.value },
      { cards: typeof source.field & { transform: true } }
    >["cards"];
    expectTypeOf<Items[number]["title"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Items[number]["nested"]["description"]>().toEqualTypeOf<
      RichText | string | undefined
    >();
    expect(source.field.type).toBe("entityField");
  });
  it.each([
    {
      name: "directions",
      cta: {
        field: "",
        constantValueEnabled: false,
        selectedType: "getDirections",
      },
      expectedLabel: "Get Directions",
      expectedLink: "30.2672",
    },
    {
      name: "preset image",
      cta: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          ctaType: "presetImage",
          label: { defaultValue: "" },
          link: { defaultValue: "/download" },
        },
      },
      expectedLabel: "",
      expectedLink: "/download",
    },
  ])(
    "when a comprehensive CTA uses $name then the renderer consumes resolved data",
    ({ cta, expectedLabel, expectedLink }) => {
      const value = {
        data: { actionType: "link", cta },
        styles: { presetImage: "app-store" },
      };
      const resolved = createYextFieldTransforms(
        { yextDisplayCoordinate: { latitude: 30.2672, longitude: -97.7431 } },
        "en"
      ).custom({
        field: toPuckFields({
          cta: { type: "comprehensiveCTA", transform: true },
        }).cta!,
        value,
        componentId: "hero",
        propName: "cta",
        propPath: "cta",
        isReadOnly: true,
      });
      expect(resolved.data.cta.label).toBe(expectedLabel);
      expect(resolved.data.cta.link).toContain(expectedLink);
      const html = renderToStaticMarkup(
        <TemplatePropsContext.Provider value={{ document: {} }}>
          <ComprehensiveCTA value={resolved} />
        </TemplatePropsContext.Provider>
      );
      expect(html).toContain(expectedLink);
      if (expectedLabel) expect(html).toContain(expectedLabel);
    }
  );
  it.each([
    { name: "unset value", value: undefined, expected: "Call to Action" },
    { name: "partial value", value: {}, expected: "Call to Action" },
    {
      name: "preset image",
      value: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              ctaType: "presetImage",
              label: "",
              link: "/download",
            },
          },
          openInNewTab: false,
        },
        styles: { variant: "primary", presetImage: "app-store" },
      },
      expected: "/download",
    },
    {
      name: "KG link",
      value: {
        data: {
          actionType: "link",
          cta: {
            field: "order",
            constantValueEnabled: false,
            constantValue: { label: "Unused", link: "/unused" },
          },
          openInNewTab: true,
        },
      },
      expected: "Pedir Restaurant",
    },
    {
      name: "constant link",
      value: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              label: { defaultValue: "Order", es: "Pedir [[name]]" },
              link: "/order",
            },
          },
          openInNewTab: false,
        },
      },
      expected: "Pedir Restaurant",
    },
    {
      name: "button",
      value: {
        data: {
          actionType: "button",
          cta: { field: "", constantValue: undefined },
          buttonText: { defaultValue: "Book", es: "Reservar [[name]]" },
          ariaLabel: { defaultValue: "Book a table", es: "Mesa en [[name]]" },
          openInNewTab: false,
        },
      },
      expected: "Reservar Restaurant",
    },
    {
      name: "directions",
      value: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValueEnabled: false,
            selectedType: "getDirections",
          },
          openInNewTab: false,
        },
      },
      expected: "30.2672",
    },
  ])(
    "when ComprehensiveCTA receives an authored $name then it matches its transformed rendering",
    ({ value, expected }) => {
      const streamDocument = {
        name: "Restaurant",
        order: {
          label: { defaultValue: "Order", es: "Pedir [[name]]" },
          link: "/order",
        },
        yextDisplayCoordinate: { latitude: 30.2672, longitude: -97.7431 },
      };
      const authored = structuredClone(value);
      const resolved = createYextFieldTransforms(streamDocument, "es").custom({
        field: toPuckFields({
          cta: { type: "comprehensiveCTA", transform: true },
        }).cta!,
        value,
        componentId: "hero",
        propName: "cta",
        propPath: "cta",
        isReadOnly: true,
      });
      const markup = [value as Partial<ComprehensiveCTAValue>, resolved].map(
        (value) =>
          renderToStaticMarkup(
            <I18nextProvider
              i18n={i18nPageInstance.cloneInstance({ lng: "es" })}
            >
              <TemplatePropsContext.Provider
                value={{ document: streamDocument }}
              >
                <ComprehensiveCTA value={value} />
              </TemplatePropsContext.Provider>
            </I18nextProvider>
          )
      );
      expect(markup[0]).toBe(markup[1]);
      expect(markup[0]).toContain(expected);
      expect(value).toEqual(authored);
    }
  );

  it("when ComprehensiveCTA receives resolved text then embedded syntax is not resolved again", () => {
    const value = {
      data: {
        actionType: "link" as const,
        cta: { label: "Literal [[name]]", link: "/order" },
        openInNewTab: false,
      },
      styles: { variant: "primary" as const },
    };
    const html = renderToStaticMarkup(
      <TemplatePropsContext.Provider
        value={{ document: { name: "Restaurant" } }}
      >
        <ComprehensiveCTA value={value} />
      </TemplatePropsContext.Provider>
    );
    expect(html).toContain("Literal [[name]]");
  });
});
