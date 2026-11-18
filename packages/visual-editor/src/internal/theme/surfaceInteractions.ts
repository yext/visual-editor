import { isDarkSurface } from "../../utils/colors.ts";
import { type SurfaceRole } from "../../utils/themeOptions.ts";

const surfaces: Record<SurfaceRole, string> = {
  page: "background",
  primary: "primary",
  secondary: "secondary",
  accent: "accent",
  muted: "muted",
};
const interactions = [
  "primary-button",
  "secondary-button",
  "link",
  "navigation-link",
];

/** Each boundary redeclares every alias, so nested light surfaces reset dark
 * ancestors. Aliases reference theme variables rather than taking snapshots.
 */
export const surfaceInteractionCss = (
  variables: Record<string, string>
): string => {
  const boundary = (selector: string, onDark: boolean) => {
    const declarations = interactions.flatMap((role) =>
      ["default", "hover", "active"].flatMap((state) =>
        (role.endsWith("button")
          ? ["text-color", "background-color", "border-color"]
          : ["text-color"]
        ).map((property) => {
          const token = `${role}-${state}-${property}`;
          return `--ve-surface-${token}:var(--ve-${token}${onDark ? "-on-dark" : ""})`;
        })
      )
    );
    declarations.push(
      `--ve-surface-preset-image-background:${onDark ? "#FFFFFF" : "#F9F9F9"}`
    );
    return `${selector}{${declarations.join(";")}}`;
  };
  return [
    ...Object.entries(surfaces).map(([role, color]) =>
      boundary(
        role === "page" ? ":root,.ve-theme-page" : `.ve-theme-${role}`,
        isDarkSurface(variables[`--ve-color-${color}`])
      )
    ),
    // An explicit boundary for image overlays; nested surface classes still reset it.
    boundary(".ve-theme-on-dark", true),
    boundary(".ve-theme-on-light", false),
  ].join("\n");
};
