import { LocatorProps, LocatorComponent } from "../Locator";

export interface LocatorCategoryProps {
  Locator: LocatorProps;
}

export const LocatorCategoryComponents = {
  Locator: LocatorComponent,
};

export const LocatorCategory = Object.keys(
  LocatorCategoryComponents
) as (keyof LocatorCategoryProps)[];
