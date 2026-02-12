import { pt } from "../../../utils/i18n/platform.ts";

export const linkTypeOptions = () => {
  return [
    {
      label: pt("linkTypes.url", "URL"),
      value: "URL",
    },
    {
      label: pt("linkTypes.email", "Email"),
      value: "EMAIL",
    },
    {
      label: pt("linkTypes.phone", "Phone"),
      value: "PHONE",
    },
    {
      label: pt("linkTypes.clickToWebsite", "Click to Website"),
      value: "CLICK_TO_WEBSITE",
    },
    {
      label: pt("linkTypes.drivingDirections", "Driving Directions"),
      value: "DRIVING_DIRECTIONS",
    },
    {
      label: pt("linkTypes.other", "Other"),
      value: "OTHER",
    },
  ];
};
