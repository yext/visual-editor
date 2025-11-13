import { themeManagerCn, useBackground } from "@yext/visual-editor";
import { cloneElement } from "react";

interface DynamicChildColorsProps {
  children: React.ReactElement;
  category: "arrow" | "slide";
}

export const DynamicChildColors = ({
  children,
  category,
}: DynamicChildColorsProps) => {
  const background = useBackground();
  const hasDarkBackground = background?.isDarkBackground;

  const dynamicClasses =
    category === "slide"
      ? hasDarkBackground
        ? "bg-white disabled:bg-gray-400"
        : "bg-palette-primary-dark disabled:bg-gray-400"
      : hasDarkBackground
        ? "text-white disabled:text-gray-400"
        : "text-palette-primary-dark disabled:text-gray-400";

  return cloneElement(children, {
    className: themeManagerCn(children.props.className, dynamicClasses),
  });
};
