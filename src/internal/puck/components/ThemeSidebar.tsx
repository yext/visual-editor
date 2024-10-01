import { Config } from "@measured/puck";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import React from "react";
import "./themeSidebar.css";

type ThemeSidebarProps = {
  puckConfig: Config;
  saveTheme: (theme: ThemeConfig) => void;
  resetTheme: (themeCategory: string, resetTo: "default" | "published") => void;
};
type StyleValue = string | number;
type StyleSelectOption = {
  label: string;
  value: StyleValue;
};
type Style =
  | {
      label: string;
      type: "color" | "number";
      value: StyleValue;
    }
  | {
      label: string;
      type: "select";
      value: StyleSelectOption;
      options: StyleSelectOption[];
    };
export type ThemeConfig = { [themeCategoryName: string]: Style[] };

const exampleThemeConfig: ThemeConfig = {
  text: [
    {
      label: "Text Color",
      type: "color",
      value: "#0000ff",
    },
    {
      label: "Font Size",
      type: "number",
      value: 12,
    },
    {
      label: "Variety",
      type: "select",
      value: {
        label: "Version A",
        value: "a",
      },
      options: [
        {
          label: "Version A",
          value: "a",
        },
        {
          label: "Version B",
          value: "b",
        },
      ],
    },
  ],
  heading: [
    {
      label: "Heading Color",
      type: "color",
      value: "#ff0000",
    },
  ],
};

const ThemeSidebar = (props: ThemeSidebarProps) => {
  const { saveTheme, resetTheme } = props;
  const themeConfig = exampleThemeConfig;

  const handleChange = (
    themeCategoryName: string,
    styleLabel: string,
    value: any
  ) => {
    console.log("Updating", themeCategoryName, styleLabel, "to ", value);
    const indexToUpdate = themeConfig[themeCategoryName].findIndex(
      (style) => style.label === styleLabel
    );
    const newThemeCategory = [...themeConfig[themeCategoryName]];
    newThemeCategory[indexToUpdate] = value;
    saveTheme({
      ...themeConfig,
      [themeCategoryName]: newThemeCategory,
    });
  };

  return (
    <AccordionRoot
      type="multiple"
      defaultValue={Object.keys(themeConfig)}
      className="ve-AccordionRoot"
    >
      {Object.entries(themeConfig).map(([themeCategoryName, styles]) => {
        return (
          <AccordionItem
            value={themeCategoryName}
            key={themeCategoryName}
            className="ve-AccordionItem"
          >
            <AccordionTrigger>
              {themeCategoryName[0].toUpperCase() + themeCategoryName.slice(1)}
            </AccordionTrigger>
            <AccordionContent>
              {styles.map((style) => {
                return (
                  <div
                    key={themeCategoryName + "-" + style.label}
                    className={"ve-StylePropertiesList"}
                  >
                    <label>{style.label}</label>
                    <div>
                      {style.type === "color" && <p>{style.value}</p>}
                      {style.type === "select" ? (
                        <select
                          onChange={(e) =>
                            handleChange(
                              themeCategoryName,
                              style.label,
                              e.target.value
                            )
                          }
                        >
                          {style.options.map((option) => {
                            return (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          type={style.type}
                          value={style.value}
                          onChange={(e) =>
                            handleChange(
                              themeCategoryName,
                              style.label,
                              e.target.value
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="ve-ThemeCateogryResetButtons">
                <button
                  type="reset"
                  onClick={() => resetTheme(themeCategoryName, "default")}
                >
                  Reset to Default
                </button>
                <button
                  type="reset"
                  onClick={() => resetTheme(themeCategoryName, "published")}
                >
                  Reset to Published
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </AccordionRoot>
  );
};

export default ThemeSidebar;

const AccordionRoot = AccordionPrimitive.Root;
const AccordionItem = AccordionPrimitive.Item;

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ children, ...props }, forwardedRef) => (
  <AccordionPrimitive.Header className="ve-AccordionHeader">
    <AccordionPrimitive.Trigger
      className={"ve-AccordionTrigger"}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <ChevronDownIcon className="ve-AccordionChevron" aria-hidden />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ children, ...props }, forwardedRef) => (
  <AccordionPrimitive.Content
    className={"ve-AccordionContent"}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
