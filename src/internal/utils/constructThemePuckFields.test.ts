import { Style, ThemeConfig } from "../../utils/themeResolver.ts";
import { describe, it, expect } from "vitest";
import {
  constructThemePuckFields,
  constructThemePuckValues,
  convertStyleToPuckField,
} from "./constructThemePuckFields.ts";

export const exampleThemeConfig: ThemeConfig = {
  text: {
    label: "Text",
    styles: {
      font: {
        label: "Font",
        styles: {
          size: {
            label: "Font Size",
            type: "number",
            default: 12,
            plugin: "fontSize",
          },
          family: {
            label: "Font Family",
            plugin: "fontFamily",
            default: "helvetica",
            type: "select",
            options: [
              {
                label: "Helvetica",
                value: "helvetica",
              },
              {
                label: "Times New Roman",
                value: "timesNewRoman",
              },
              {
                label: "Arial",
                value: "arial",
              },
            ],
          },
        },
      },
      color: {
        label: "Color",
        styles: {
          lightMode: {
            label: "Light Mode",
            styles: {
              mainColor: {
                label: "Main Color",
                plugin: "fontColor",
                type: "color",
                default: "black",
              },
              secondaryColor: {
                label: "Secondary Color",
                plugin: "fontColor",
                type: "color",
                default: "grey",
              },
            },
          },
          darkMode: {
            label: "Dark Mode",
            styles: {
              mainColor: {
                label: "Main Color",
                plugin: "fontColor",
                type: "color",
                default: "black",
              },
              secondaryColor: {
                label: "Secondary Color",
                plugin: "fontColor",
                type: "color",
                default: "grey",
              },
            },
          },
        },
      },
    },
  },
  heading: {
    label: "Headings",
    styles: {
      color: {
        label: "Heading Color",
        type: "color",
        plugin: "colors",
        default: "#FF0000",
      },
    },
  },
};

describe("constructThemePuckFields", () => {
  it("constructs theme fields from a parent style", () => {
    const result = constructThemePuckFields(exampleThemeConfig.text);

    // TODO: update to use color picker
    expect(result).toEqual({
      label: "Text",
      type: "object",
      objectFields: {
        font: {
          label: "Font",
          type: "object",
          objectFields: {
            size: {
              label: "Font Size",
              type: "number",
            },
            family: {
              label: "Font Family",
              type: "select",
              options: [
                { label: "Helvetica", value: "helvetica" },
                { label: "Times New Roman", value: "timesNewRoman" },
                { label: "Arial", value: "arial" },
              ],
            },
          },
        },
        color: {
          label: "Color",
          type: "object",
          objectFields: {
            lightMode: {
              label: "Light Mode",
              type: "object",
              objectFields: {
                mainColor: {
                  label: "Main Color",
                  type: "text",
                },
                secondaryColor: {
                  label: "Secondary Color",
                  type: "text",
                },
              },
            },
            darkMode: {
              label: "Dark Mode",
              type: "object",
              objectFields: {
                mainColor: {
                  label: "Main Color",
                  type: "text",
                },
                secondaryColor: {
                  label: "Secondary Color",
                  type: "text",
                },
              },
            },
          },
        },
      },
    });
  });
});

describe("convertStyleToPuckField", () => {
  it("converts number style to number field", () => {
    const numberStyle: Style = {
      label: "Font Size",
      type: "number",
      plugin: "fontSize",
      default: 0,
    };

    const result = convertStyleToPuckField(numberStyle);

    expect(result).toEqual({
      label: "Font Size",
      type: "number",
    });
  });

  it("converts select style to select field", () => {
    const selectStyle: Style = {
      label: "Font Family",
      type: "select",
      plugin: "fontFamily",
      default: "arial",
      options: [
        { label: "Helvetica", value: "helvetica" },
        { label: "Arial", value: "arial" },
      ],
    };

    const result = convertStyleToPuckField(selectStyle);

    expect(result).toEqual({
      label: "Font Family",
      type: "select",
      options: selectStyle.options,
    });
  });

  it("converts color style to color field", () => {
    // TODO: update to use color picker
    const colorStyle: Style = {
      label: "Main Color",
      type: "color",
      default: "000000",
      plugin: "colors",
    };

    const result = convertStyleToPuckField(colorStyle);

    expect(result).toEqual({
      label: "Main Color",
      type: "text",
    });
  });
});

describe("constructThemePuckValues", () => {
  it("constructs theme puck values using saved theme values", () => {
    const savedThemeValues = {
      font: {
        size: 16,
        family: "arial",
      },
      color: {
        lightMode: {
          mainColor: "blue",
          secondaryColor: "lightgrey",
        },
      },
    };

    const result = constructThemePuckValues(
      savedThemeValues,
      exampleThemeConfig.text
    );

    expect(result).toEqual({
      font: {
        size: 16, // from saved values
        family: "arial", // from saved values
      },
      color: {
        lightMode: {
          mainColor: "blue", // from saved values
          secondaryColor: "lightgrey", // from saved values
        },
        darkMode: {
          mainColor: "black", // default value
          secondaryColor: "grey", // default value
        },
      },
    });
  });

  it("uses default values for missing saved theme values", () => {
    const savedThemeValues = {};

    const result = constructThemePuckValues(
      savedThemeValues,
      exampleThemeConfig.text
    );

    expect(result).toEqual({
      font: {
        size: 12, // default value
        family: "helvetica", // default value
      },
      color: {
        lightMode: {
          mainColor: "black", // default value
          secondaryColor: "grey", // default value
        },
        darkMode: {
          mainColor: "black", // default value
          secondaryColor: "grey", // default value
        },
      },
    });
  });

  it("handles a mix of saved and default theme values", () => {
    const savedThemeValues = {
      font: {
        size: 14, // provided value
      },
      color: {
        lightMode: {
          mainColor: "red", // provided value
        },
      },
    };

    const result = constructThemePuckValues(
      savedThemeValues,
      exampleThemeConfig.text
    );

    expect(result).toEqual({
      font: {
        size: 14, // from saved values
        family: "helvetica", // default value
      },
      color: {
        lightMode: {
          mainColor: "red", // from saved values
          secondaryColor: "grey", // default value
        },
        darkMode: {
          mainColor: "black", // default value
          secondaryColor: "grey", // default value
        },
      },
    });
  });
});
