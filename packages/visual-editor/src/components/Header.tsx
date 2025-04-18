import * as React from "react";
import {
  CTA as CTAType,
  Image,
  ComplexImageType,
} from "@yext/pages-components";
import { ComponentConfig } from "@measured/puck";
import {
  CTA,
  EntityField,
  useDocument,
  MaybeLink,
  PageSection,
  backgroundColors,
  Background,
} from "@yext/visual-editor";
import { FaTimes, FaBars } from "react-icons/fa";

const PLACEHOLDER_IMAGE: ComplexImageType = {
  image: {
    url: "https://placehold.co/50",
    height: 50,
    width: 50,
    alternateText: "Placeholder Logo",
  },
};

export type HeaderProps = Record<string, never>;

export const Header: ComponentConfig<HeaderProps> = {
  label: "Header",
  render: () => <HeaderComponent />,
};

const HeaderComponent: React.FC<HeaderProps> = () => {
  const document: {
    _site?: {
      header?: {
        links?: CTAType[];
      };
      logo?: ComplexImageType;
    };
  } = useDocument();
  const links = document._site?.header?.links ?? [];
  const logo = document._site?.logo ?? PLACEHOLDER_IMAGE;

  return <HeaderLayout links={links} logo={logo} />;
};

interface HeaderLayoutProps {
  links: CTAType[];
  logoLink?: string;
  logo?: ComplexImageType;
}

const HeaderLayout = (props: HeaderLayoutProps) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { logo, logoLink, links } = props;

  return (
    <PageSection
      as="header"
      verticalPadding="header"
      background={backgroundColors.background1.value}
    >
      <div className="flex justify-start md:justify-between items-center">
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
              className="flex md:hidden ml-auto my-auto"
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
    </PageSection>
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

const HeaderLinks = (props: { links: CTAType[] }) => {
  return (
    <div className="hidden md:flex items-center">
      <ul className="flex gap-4 lg:gap-10">
        {props.links.map((item, idx) => (
          <li key={item.link}>
            <CTA
              label={item.label}
              link={item.link}
              linkType={item.linkType}
              variant="link"
              eventName={`headerlink${idx}`}
              alwaysHideCaret={true}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

type HeaderMobileMenuProps = {
  isOpen?: boolean;
  links: CTAType[];
};

const HeaderMobileMenu = (props: HeaderMobileMenuProps) => {
  const { isOpen, links } = props;
  return (
    <div
      className={
        `${isOpen ? "visible" : "hidden"} bg-white text-black` +
        "components absolute left-0 right-0 h-screen z-50"
      }
    >
      <Background
        background={backgroundColors.background1.value}
        className="container"
      >
        <ul className="flex flex-col p-4 gap-4">
          {links.map((item: CTAType, idx) => (
            <li key={item.link}>
              <CTA
                link={item.link}
                label={item.label}
                linkType={item.linkType}
                variant="link"
                eventName={`headermobilelink${idx}`}
              />
            </li>
          ))}
        </ul>
      </Background>
    </div>
  );
};
