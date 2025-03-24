import * as React from "react";
import { Link, CTA, Image, ComplexImageType } from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import { EntityField, useDocument, BasicSelector } from "../../index.ts";
import { MaybeLink } from "./atoms/maybeLink.tsx";
import { FaTimes, FaBars } from "react-icons/fa";

const PLACEHOLDER_IMAGE: ComplexImageType = {
  image: {
    url: "https://placehold.co/50",
    height: 50,
    width: 50,
    alternateText: "Placeholder Logo",
  },
};

export type HeaderProps = object;

const headerFields: Fields<HeaderProps> = {
  backgroundColor: BasicSelector("Background Color", [
    { label: "Default", value: "default" },
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Accent", value: "accent" },
    { label: "Text", value: "text" },
    { label: "Background", value: "background" },
  ]),
};

export const Header: ComponentConfig<HeaderProps> = {
  fields: headerFields,
  label: "Header",
  render: (props) => <HeaderComponent {...props} />,
};

const HeaderComponent: React.FC<HeaderProps> = () => {
  const document: {
    _site?: {
      header?: {
        links?: CTA[];
      };
      logo?: ComplexImageType;
    };
  } = useDocument();
  const links = document._site?.header?.links ?? [];
  const logo = document._site?.logo ?? PLACEHOLDER_IMAGE;

  return <HeaderLayout links={links} logo={logo} />;
};

interface HeaderLayoutProps extends HeaderProps {
  links: CTA[];
  logoLink?: string;
  logo?: ComplexImageType;
}

const HeaderLayout = (props: HeaderLayoutProps) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { logo, logoLink, links } = props;

  return (
    <header
      className={`components font-body-fontFamily relative bg-white text-black`}
    >
      <div
        className={
          "container mx-auto py-5 flex justify-start md:justify-between " +
          "px-4 sm:px-8 lg:px-16 xl:px-20 items-center"
        }
      >
        {logo && (
          <EntityField
            displayName="Business Logo"
            fieldId={"site.businessLogo"}
          >
            <HeaderLogo logo={logo} logoLink={logoLink} />
          </EntityField>
        )}

        {links?.length > 0 && (
          <>
            <EntityField
              displayName="Header Links"
              fieldId={"site.header.links"}
            >
              <HeaderLinks links={links} />
            </EntityField>
            <button
              className="flex md:hidden absolute p-4 right-0 top-1/2 -translate-y-1/2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close header menu" : "Open header menu"}
            >
              {menuOpen ? (
                <FaTimes size={"1.5rem"} />
              ) : (
                <FaBars size={"1.5rem"} />
              )}
            </button>
          </>
        )}
      </div>

      {links?.length > 0 && (
        <HeaderMobileMenu isOpen={menuOpen} links={links} />
      )}
    </header>
  );
};

const HeaderLogo = (props: { logo: ComplexImageType; logoLink?: string }) => {
  return (
    <MaybeLink href={props.logoLink}>
      <div className="flex mr-2 h-[50px]">
        <Image
          image={props.logo}
          layout="aspect"
          aspectRatio={props.logo.image.width / props.logo.image.height}
        />
      </div>
    </MaybeLink>
  );
};

const HeaderLinks = (props: { links: CTA[] }) => {
  return (
    <div className="hidden md:flex items-center">
      <ul className="flex gap-4 lg:gap-10">
        {props.links.map((item: CTA, idx) => (
          <li key={item.link}>
            <Link
              className="text-header-linkColor text-header-linkFontSize hover:underline"
              cta={item}
              eventName={`headerlink${idx}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

type HeaderMobileMenuProps = {
  isOpen?: boolean;
  links: CTA[];
};

const HeaderMobileMenu = (props: HeaderMobileMenuProps) => {
  const { isOpen, links } = props;
  return (
    <div
      className={
        `${isOpen ? "visible" : "hidden"} bg-white text-black` +
        "components absolute top-full left-0 right-0 h-screen z-50"
      }
    >
      <div className={`container bg-white text-black`}>
        <ul className="flex flex-col px-4">
          {links.map((item: CTA, idx) => (
            <li key={item.link}>
              <Link
                className="py-3 block text-header-linkColor text-header-linkFontSize"
                cta={item}
                eventName={`headermobilelink${idx}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
