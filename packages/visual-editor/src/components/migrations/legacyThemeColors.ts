import type { ThemeColor } from "../../utils/themeConfigOptions.ts";
import { msg } from "../../utils/i18n/platform.ts";

export const backgroundColors: Record<
  string,
  {
    label: string;
    value: ThemeColor;
  }
> = {
  background1: {
    label: msg("theme.bg.bg1", "Background 1"),
    value: { selectedColor: "white", contrastingColor: "black" },
  },
  background2: {
    label: msg("theme.bg.bg2", "Background 2"),
    value: {
      selectedColor: "palette-primary-light",
      contrastingColor: "black",
    },
  },
  background3: {
    label: msg("theme.bg.bg3", "Background 3"),
    value: {
      selectedColor: "palette-secondary-light",
      contrastingColor: "black",
    },
  },
  background4: {
    label: msg("theme.bg.bg4", "Background 4"),
    value: {
      selectedColor: "palette-tertiary-light",
      contrastingColor: "black",
    },
  },
  background5: {
    label: msg("theme.bg.bg5", "Background 5"),
    value: {
      selectedColor: "palette-quaternary-light",
      contrastingColor: "black",
    },
  },
  background6: {
    label: msg("theme.bg.bg6", "Background 6"),
    value: {
      selectedColor: "palette-primary-dark",
      contrastingColor: "white",
    },
  },
  background7: {
    label: msg("theme.bg.bg7", "Background 7"),
    value: {
      selectedColor: "palette-secondary-dark",
      contrastingColor: "white",
    },
  },
  color1: {
    label: msg("theme.bg.color1", "Color 1"),
    value: {
      selectedColor: "palette-primary",
      contrastingColor: "palette-primary-contrast",
    },
  },
  color2: {
    label: msg("theme.bg.color2", "Color 2"),
    value: {
      selectedColor: "palette-secondary",
      contrastingColor: "palette-secondary-contrast",
    },
  },
  color3: {
    label: msg("theme.bg.color3", "Color 3"),
    value: {
      selectedColor: "palette-tertiary",
      contrastingColor: "palette-tertiary-contrast",
    },
  },
  color4: {
    label: msg("theme.bg.color4", "Color 4"),
    value: {
      selectedColor: "palette-quaternary",
      contrastingColor: "palette-quaternary-contrast",
    },
  },
};
