import { CoreStyle, Style, ThemeConfig } from "../../utils/themeResolver.ts";
import { describe, it, expect } from "vitest";
import {
  assignValue,
  constructThemePuckFields,
  constructThemePuckValues,
  convertStyleToPuckField,
} from "./constructThemePuckFields.ts";

export const exampleThemeConfig: ThemeConfig = {
  text: {
    label: "Text",
    styles: {
      size: {
        label: "Size",
        plugin: "fontSize",
        type: "number",
        default: 12,
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
        plugin: "colors",
        styles: {
          mainColor: {
            label: "Main Color",
            type: "color",
            default: "black",
          },
          secondaryColor: {
            label: "Secondary Color",
            type: "color",
            default: "grey",
          },
        },
      },
      darkMode: {
        label: "Dark Mode",
        plugin: "colors",
        styles: {
          mainColor: {
            label: "Main Color",
            type: "color",
            default: "black",
          },
          secondaryColor: {
            label: "Secondary Color",
            type: "color",
            default: "grey",
          },
        },
      },
      heading: {
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

    expect(result).toMatchObject({
      label: "Text",
      type: "object",
      objectFields: {
        size: {
          label: "Size",
          type: "number",
        },
        family: {
          label: "Font Family",
          type: "custom",
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

    const result = convertStyleToPuckField(numberStyle, numberStyle.plugin);

    expect(result).toEqual({
      label: "Font Size",
      type: "number",
    });
  });

  it("converts select style to select field", () => {
    const selectStyle: Style = {
      label: "Underline",
      type: "select",
      plugin: "fontStyle",
      default: "none",
      options: [
        { label: "Underline", value: "underline" },
        { label: "None", value: "" },
      ],
    };
    const result = convertStyleToPuckField(selectStyle, selectStyle.plugin);

    expect(result).toEqual({
      label: "Underline",
      type: "select",
      options: selectStyle.options,
    });
  });

  it("converts fontFamily style to font select field", () => {
    const fontFamilyStyle: Style = {
      label: "Font Family",
      type: "select",
      plugin: "fontFamily",
      default: "arial",
      options: [
        { label: "Helvetica", value: "helvetica" },
        { label: "Arial", value: "arial" },
      ],
    };

    const result = convertStyleToPuckField(
      fontFamilyStyle,
      fontFamilyStyle.plugin
    );

    expect(result).toMatchObject({
      label: "Font Family",
      type: "custom",
      options: fontFamilyStyle.options,
    });
  });

  it("converts color style to color field", () => {
    const colorStyle: Style = {
      label: "Main Color",
      type: "color",
      default: "#000000",
      plugin: "colors",
    };

    const result = convertStyleToPuckField(colorStyle, colorStyle.plugin);

    expect(result).toMatchObject({
      label: "Main Color",
      type: "custom",
    });
  });
});

describe("assignValue", () => {
  it("returns the default value when there is no stored value", () => {
    const style: CoreStyle = {
      label: "Style",
      type: "number",
      default: 10,
    };

    const result = assignValue(style, undefined);
    expect(result).toEqual(10);
  });

  it("returns the stored value for color fields", () => {
    const storedValue = "#FFFFFF";
    const style: CoreStyle = {
      label: "Style",
      type: "color",
      default: "#000000",
    };

    const result = assignValue(style, storedValue);
    expect(result).toEqual("#FFFFFF");
  });

  it("returns the stored value for select fields", () => {
    const storedValue = "a";
    const style: CoreStyle = {
      label: "Style",
      type: "select",
      default: "b",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    };

    const result = assignValue(style, storedValue);
    expect(result).toEqual("a");
  });

  it("returns the stored value for number fields", () => {
    const storedValue = "10px";
    const style: CoreStyle = {
      label: "Style",
      type: "number",
      default: 0,
    };

    const result = assignValue(style, storedValue);
    expect(result).toEqual(10);
  });

  it("returns the default value for corrupted number fields", () => {
    const storedValue = "abcdef";
    const style: CoreStyle = {
      label: "Style",
      type: "number",
      default: 5,
    };

    const result = assignValue(style, storedValue);
    expect(result).toEqual(5);
  });
});

describe("constructThemePuckValues", () => {
  it("constructs theme puck values using saved theme values", () => {
    const savedThemeValues = {
      "--colors-color-lightMode-mainColor": "green",
      "--colors-color-lightMode-secondaryColor": "orange",
      "--colors-color-darkMode-mainColor": "blue",
      "--colors-color-darkMode-secondaryColor": "purple",
      "--colors-color-heading": "red",
    };

    const result = constructThemePuckValues(
      savedThemeValues,
      exampleThemeConfig.color,
      "color"
    );

    expect(result).toEqual({
      lightMode: {
        mainColor: "green",
        secondaryColor: "orange",
      },
      darkMode: {
        mainColor: "blue",
        secondaryColor: "purple",
      },
      heading: "red",
    });
  });

  it("uses default values for missing saved theme values", () => {
    const savedThemeValues = {};

    const result = constructThemePuckValues(
      savedThemeValues,
      exampleThemeConfig.color,
      "color"
    );

    expect(result).toEqual({
      lightMode: {
        mainColor: "black",
        secondaryColor: "grey",
      },
      darkMode: {
        mainColor: "black",
        secondaryColor: "grey",
      },
      heading: "#FF0000",
    });
  });

  it("handles a mix of saved and default theme values", () => {
    const savedThemeValues = {
      "--colors-color-lightMode-mainColor": "green",
      "--colors-color-lightMode-secondaryColor": "orange",
      "--colors-color-heading": "red",
    };

    const result = constructThemePuckValues(
      savedThemeValues,
      exampleThemeConfig.color,
      "color"
    );

    expect(result).toEqual({
      lightMode: {
        mainColor: "green",
        secondaryColor: "orange",
      },
      darkMode: {
        mainColor: "black",
        secondaryColor: "grey",
      },
      heading: "red",
    });
  });
});
