import * as React from "react";
import { CTA as CTAType, ComplexImageType } from "@yext/pages-components";
import { ComponentConfig } from "@measured/puck";
import {
  CTA,
  EntityField,
  useDocument,
  MaybeLink,
  PageSection,
  backgroundColors,
  Background,
  YextField,
  Image,
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

export type HeaderProps = {
  logoWidth: number;
};

export const Header: ComponentConfig<HeaderProps> = {
  label: "Header",
  fields: {
    logoWidth: YextField("Logo Width", {
      type: "number",
      min: 0,
    }),
  },
  defaultProps: {
    logoWidth: 80,
  },
  render: (props) => <HeaderComponent {...props} />,
};

const HeaderComponent: React.FC<HeaderProps> = ({ logoWidth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mainSectionHeight, setMainSectionHeight] = React.useState(0);

  return (
    <header>
      <HeaderSecondarySection />
      <HeaderMainSection
        logoWidth={logoWidth}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setMainSectionHeight={setMainSectionHeight}
      />
      <HeaderMobileMenu
        isOpen={mobileMenuOpen}
        mainSectionHeight={mainSectionHeight}
      />
    </header>
  );
};

const HeaderMainSection = (props: {
  logoWidth: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  setMainSectionHeight: (v: number) => void;
}) => {
  const { logoWidth, mobileMenuOpen, setMobileMenuOpen, setMainSectionHeight } =
    props;

  const document: {
    _site?: {
      header?: {
        links?: CTAType[];
        primaryCta?: CTAType;
        secondaryCta?: CTAType;
      };
      logo?: ComplexImageType;
    };
  } = useDocument();
  const links = document._site?.header?.links ?? [];
  const logo = document._site?.logo ?? PLACEHOLDER_IMAGE;
  const primaryCta = document._site?.header?.primaryCta;
  const secondaryCta = document._site?.header?.secondaryCta;

  // store the height of the main section for use in the mobile menu
  const headerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (headerRef.current) {
      setMainSectionHeight(headerRef.current.offsetHeight);
    }
  }, [mobileMenuOpen]);

  return (
    <PageSection
      as="div"
      verticalPadding="header"
      background={backgroundColors.background1.value}
      className="flex justify-between items-center relative"
      ref={headerRef}
    >
      {logo && (
        <EntityField displayName="Business Logo" fieldId={"site.businessLogo"}>
          <HeaderLogo logo={logo} logoWidth={logoWidth} />
        </EntityField>
      )}
      <div className="flex justify-end items-center gap-8">
        {
          <>
            <HeaderLinks links={links} />
            <button
              className="flex md:hidden ml-auto my-auto"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={
                mobileMenuOpen ? "Close header menu" : "Open header menu"
              }
            >
              {mobileMenuOpen ? (
                <FaTimes size={"16px"} />
              ) : (
                <FaBars size={"16px"} />
              )}
            </button>
          </>
        }
        <HeaderCTASection primaryCta={primaryCta} secondaryCta={secondaryCta} />
      </div>
    </PageSection>
  );
};

const HeaderLogo = (props: {
  logo: ComplexImageType;
  logoLink?: string;
  logoWidth?: number;
}) => {
  return (
    <MaybeLink href={props.logoLink}>
      <div className="flex mr-2" style={{ width: `${props.logoWidth}px` }}>
        <Image
          image={props.logo.image}
          layout="auto"
          aspectRatio={props.logo.image.width / props.logo.image.height}
        />
      </div>
    </MaybeLink>
  );
};

const HeaderLinks = (props: { links?: CTAType[] }) => {
  if (!props.links?.length) {
    return;
  }

  return (
    <div className="hidden md:flex items-center">
      <EntityField displayName="Header Links" fieldId={"site.header.links"}>
        <ul className="flex gap-4 lg:gap-10">
          {props.links.map((item, idx) => (
            <li key={item.link}>
              <CTA
                label={item.label}
                link={item.link}
                linkType={item.linkType}
                variant="headerFooterMainLink"
                eventName={`headerlink${idx}`}
                alwaysHideCaret={true}
              />
            </li>
          ))}
        </ul>
      </EntityField>
    </div>
  );
};

const HeaderCTASection = (props: {
  primaryCta?: CTAType;
  secondaryCta?: CTAType;
}) => {
  const { primaryCta, secondaryCta } = props;

  if (!primaryCta && !secondaryCta) {
    return;
  }

  return (
    <div className="hidden md:flex items-center gap-2">
      {primaryCta && (
        <EntityField displayName="Primary CTA" fieldId="site.header.primaryCta">
          <CTA
            label={primaryCta.label}
            link={primaryCta.link}
            linkType={primaryCta.linkType}
            variant="primary"
            eventName="headerPrimaryCta"
          />
        </EntityField>
      )}
      {secondaryCta && (
        <EntityField
          displayName="Secondary CTA"
          fieldId="site.header.secondaryCta"
        >
          <CTA
            label={secondaryCta.label}
            link={secondaryCta.link}
            linkType={secondaryCta.linkType}
            variant="secondary"
            eventName="headerSecondaryCta"
          />
        </EntityField>
      )}
    </div>
  );
};

const HeaderSecondarySection = () => {
  const document: {
    _site?: {
      header?: {
        secondaryLinks?: CTAType[];
      };
    };
  } = useDocument();
  const secondaryLinks = document._site?.header?.secondaryLinks;

  if (!secondaryLinks?.length) {
    return;
  }

  return (
    <PageSection
      as="div"
      verticalPadding="headerSecondary"
      background={{ bgColor: "bg-[#F4F4F4]", textColor: "text-black" }}
      outerClassName="hidden md:block"
    >
      <EntityField
        displayName="Secondary Header Links"
        fieldId="site.header.secondaryLinks"
      >
        <div className="flex justify-end items-center gap-6">
          {secondaryLinks.map((link, idx) => {
            return (
              <CTA
                key={"secondarylink" + idx}
                link={link.link}
                label={link.label}
                linkType={link.linkType}
                variant={"headerSecondaryLink"}
                eventName={"headerSecondaryLink" + idx}
              />
            );
          })}
        </div>
      </EntityField>
    </PageSection>
  );
};

const HeaderMobileMenu = (props: {
  isOpen: boolean;
  mainSectionHeight: number;
}) => {
  const { isOpen, mainSectionHeight } = props;

  const document: {
    _site?: {
      header?: {
        secondaryLinks?: CTAType[];
        links: CTAType[];
        primaryCta: CTAType;
      };
    };
  } = useDocument();
  const links = document._site?.header?.links;
  const secondaryLinks = document._site?.header?.secondaryLinks;
  const primaryCta = document._site?.header?.primaryCta;

  if (!isOpen) {
    return;
  }

  return (
    <div
      className={"bg-white text-black absolute left-0 w-full z-40"}
      style={{
        top: `${mainSectionHeight}px`,
        height: `calc(100vh - ${mainSectionHeight}px)`,
      }}
    >
      <Background
        background={backgroundColors.background1.value}
        className="flex flex-col justify-between h-full"
      >
        <div>
          <EntityField
            displayName="Header Links"
            fieldId="site.header.links"
            zIndex={45}
          >
            <div className="px-4">
              {links?.map((item: CTAType, idx) => (
                <CTA
                  key={`headermobilelink${idx}`}
                  link={item.link}
                  label={item.label}
                  linkType={item.linkType}
                  variant="directoryLink"
                  eventName={`headermobilelink${idx}`}
                  className="border-none font-bold text-link-sm-fontSize"
                />
              ))}
            </div>
          </EntityField>
          <EntityField
            displayName="Secondary Header Links"
            fieldId="site.header.secondaryLinks"
            zIndex={45}
          >
            <div className="bg-[#F4F4F4] px-4">
              {secondaryLinks?.map((item: CTAType, idx) => (
                <CTA
                  key={`headermobilesecondarylink${idx}`}
                  link={item.link}
                  label={item.label}
                  linkType={item.linkType}
                  variant="headerSecondaryLink"
                  eventName={`headerMobileSecondaryLink${idx}`}
                  className="py-4 justify-start"
                />
              ))}
            </div>
          </EntityField>
        </div>
        <div className="px-4 pb-4">
          {primaryCta && (
            <EntityField
              displayName="Primary CTA"
              fieldId="site.header.primaryCta"
              zIndex={45}
            >
              <CTA
                link={primaryCta.link}
                label={primaryCta.label}
                linkType={primaryCta.linkType}
                variant={"primary"}
              />
            </EntityField>
          )}
        </div>
      </Background>
    </div>
  );
};
