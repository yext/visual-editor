import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render, waitFor } from "@testing-library/react";
import {
  Puck,
  type Config,
  type Data,
  type FieldTransforms,
} from "@puckeditor/core";
import { ErrorProvider } from "../contexts/ErrorContext.tsx";
import { VisualEditorRender } from "./VisualEditorRender.tsx";
import { toPuckFields } from "../fields/fields.ts";
import { VisualEditorProvider } from "../utils/VisualEditorProvider.tsx";
import { ComprehensiveCTA } from "../components/helpers/ComprehensiveCTA.tsx";
import {
  createStyledTextConfig,
  StyledTextComponent,
} from "../components/helpers/styledFields/createStyledTextConfig.tsx";
import { createPuckFieldTransforms } from "../fields/fieldTransforms.ts";

describe("VisualEditorRender field transforms", () => {
  afterEach((): void => {
    vi.unstubAllGlobals();
  });
  it("when nested content is rendered in the editor and published page then both use the current locale and document", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })
    );
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      }
    );
    const config: Config = {
      components: {
        Card: {
          defaultProps: {
            caption: { defaultValue: "Default [[name]]" },
          },
          fields: toPuckFields({
            caption: { type: "translatableString" },
            content: {
              type: "object",
              objectFields: {
                title: {
                  type: "entityField",

                  filter: { types: ["type.string"] },
                },
                links: {
                  type: "array",
                  arrayFields: {
                    label: { type: "translatableString" },
                  },
                },
              },
            },
          }),
          render: ({ content, caption }): React.ReactElement => (
            <article>
              {content.title}:{content.links[0].label}:{caption}
            </article>
          ),
        },
        Container: {
          fields: { children: { type: "slot" } },
          render: ({ children: Children }): React.ReactElement => (
            <section>
              <Children />
            </section>
          ),
        },
      },
    };
    const data: Data = {
      root: { props: {} },
      content: [
        {
          type: "Container",
          props: {
            id: "container",
            children: [
              {
                type: "Card",
                props: {
                  id: "card",
                  content: {
                    title: {
                      field: "name",
                      constantValue: "",
                      constantValueEnabled: false,
                    },
                    links: [
                      {
                        label: {
                          defaultValue: "Hello [[name]]",
                          fr: "Bonjour [[name]]",
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      ],
    };
    const before = structuredClone(data);
    for (const streamDocument of [
      { locale: "en", name: "One" },
      { locale: "fr", name: "Deux" },
    ]) {
      const expected =
        streamDocument.locale === "en"
          ? "One:Hello One:Default One"
          : "Deux:Bonjour Deux:Default Deux";
      expect(
        renderToStaticMarkup(
          <ErrorProvider>
            <VisualEditorRender
              config={config}
              data={data}
              metadata={{ streamDocument }}
            />
          </ErrorProvider>
        )
      ).toContain(expected);
      const view = render(
        <Puck
          config={config}
          data={data}
          fieldTransforms={
            createPuckFieldTransforms(
              streamDocument.locale,
              streamDocument
            ) as FieldTransforms<Config>
          }
          iframe={{ enabled: false }}
        >
          <Puck.Preview />
        </Puck>
      );
      await waitFor(() =>
        expect(view.container.textContent).toContain(expected)
      );
      view.unmount();
    }
    expect(data).toEqual(before);
  });

  it.each([
    {
      name: "localized link",
      actionType: "link",
      ctaType: "textAndLink",
      mapped: false,
      missing: false,
      expected: 'href="/book"',
      label: "Réserver Restaurant",
    },
    {
      name: "mapped directions",
      actionType: "link",
      ctaType: "getDirections",
      mapped: true,
      missing: false,
      expected: "Get Directions",
      label: "Get Directions",
    },
    {
      name: "constant directions",
      actionType: "link",
      ctaType: "getDirections",
      mapped: false,
      missing: false,
      expected: "Réserver Restaurant",
      label: "Réserver Restaurant",
    },
    {
      name: "preset image",
      actionType: "link",
      ctaType: "presetImage",
      mapped: false,
      missing: false,
      expected: "<svg",
      label: "Réserver Restaurant",
    },
    {
      name: "custom button",
      actionType: "button",
      ctaType: "textAndLink",
      mapped: false,
      missing: false,
      expected: 'data-action="reserve"',
      label: "Choisir Restaurant",
    },
    {
      name: "missing mapped CTA",
      actionType: "link",
      ctaType: "textAndLink",
      mapped: true,
      missing: true,
      expected: "<h2",
      label: undefined,
    },
  ])(
    "when $name passes through transforms then the existing renderers consume plain content",
    ({ actionType, ctaType, mapped, missing, expected, label }) => {
      const heading = createStyledTextConfig({ kind: "plain", label: "Title" });
      const body = createStyledTextConfig({
        kind: "richText",
        label: "Description",
      });
      const config: Config = {
        components: {
          Hero: {
            fields: toPuckFields({
              heading: { type: "object", objectFields: heading.fields! },
              body: { type: "object", objectFields: body.fields! },
              cta: { type: "comprehensiveCTA" },
            }),
            render: ({ heading, body, cta }): React.ReactElement => (
              <>
                <StyledTextComponent {...heading} kind="plain" tag="h2" />
                <StyledTextComponent {...body} kind="richText" />
                <ComprehensiveCTA value={cta} eventName="heroAction" />
              </>
            ),
          },
        },
      };
      const data: Data = {
        root: { props: {} },
        content: [
          {
            type: "Hero",
            props: {
              id: "hero",
              heading: {
                ...heading.defaultProps,
                data: {
                  text: {
                    field: "name",
                    constantValue: "",
                    constantValueEnabled: false,
                  },
                },
              },
              body: {
                ...body.defaultProps,
                data: {
                  text: {
                    field: "",
                    constantValue: {
                      defaultValue: { html: "<p>Visit [[name]]</p>" },
                    },
                    constantValueEnabled: true,
                  },
                },
              },
              cta: {
                data: {
                  actionType,
                  cta: {
                    field: missing ? "missing" : "mappedCta",
                    constantValueEnabled: !mapped,
                    selectedType: ctaType,
                    constantValue: {
                      ctaType,
                      label: { defaultValue: "Book", fr: "Réserver [[name]]" },
                      link: { defaultValue: "/[[slug]]" },
                      linkType: "URL",
                    },
                  },
                  openInNewTab: true,
                  buttonText: {
                    defaultValue: "Choose",
                    fr: "Choisir [[name]]",
                  },
                  ariaLabel: { defaultValue: "Reserve [[name]]" },
                  customId: "reserve",
                  customClass: "reservation-action",
                  dataAttributes: [{ key: "action", value: "reserve" }],
                },
                styles: {
                  variant: "primary",
                  presetImage: "app-store",
                  button: { fontFamily: "Georgia", fontSize: "18px" },
                },
                sx: { marginTop: "2px" },
              },
            },
          },
        ],
      };
      const before = structuredClone(data);
      const streamDocument = {
        locale: "fr",
        name: "Restaurant",
        slug: "book",
        mappedCta: { label: "Ignored directions label", link: "/ignored" },
      };
      const html = renderToStaticMarkup(
        <VisualEditorProvider templateProps={{ document: streamDocument }}>
          <VisualEditorRender
            config={config}
            data={data}
            metadata={{ streamDocument }}
          />
        </VisualEditorProvider>
      );
      expect(html).toContain("<h2");
      expect(html).toContain("<p>Visit Restaurant</p>");
      expect(html).toContain(expected);
      if (label) {
        expect(html).toContain(label);
        expect(html).toContain("margin-top:2px");
        if (actionType === "button") {
          expect(html).toContain('id="reserve"');
          expect(html).toContain('aria-label="Reserve Restaurant"');
        } else {
          expect(html).toContain('target="_blank"');
        }
      } else {
        expect(html).not.toContain("<a ");
        expect(html).not.toContain("<button");
      }
      expect(data).toEqual(before);
    }
  );
});
