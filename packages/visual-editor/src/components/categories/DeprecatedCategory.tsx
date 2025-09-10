import { Header, HeaderProps } from "../header/Header.tsx";
import { Footer, FooterProps } from "../footer/Footer.tsx";

export interface DeprecatedCategoryProps {
  Header: HeaderProps;
  Footer: FooterProps;
}

export const DeprecatedCategoryComponents = {
  Header,
  Footer,
};

export const DeprecatedCategory = Object.keys(
  DeprecatedCategoryComponents
) as (keyof DeprecatedCategoryProps)[];
