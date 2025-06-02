import * as React from "react";
import { ComplexImageType, CTA as CTAType } from "@yext/pages-components";
import { ComponentConfig, Fields, WithId, WithPuckProps } from "@measured/puck";
import {
  Body,
  EntityField,
  useDocument,
  CTA,
  type BackgroundStyle,
  backgroundColors,
  PageSection,
  YextField,
  Image,
} from "@yext/visual-editor";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaPinterest,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

type socialLink = {
  name: string;
  link: string;
  label: any;
  prefix?: string;
};

type FooterLinkSection = {
  label: string;
  links: CTAType[];
};

type FooterProps = {
  backgroundColor?: BackgroundStyle;
  logoWidth: number;
};

const footerFields: Fields<FooterProps> = {
  backgroundColor: YextField("Background Color", {
    type: "select",
    hasSearch: true,
    options: "BACKGROUND_COLOR",
  }),
  logoWidth: YextField("Logo Width", {
    type: "number",
    min: 0,
  }),
};

const Footer: ComponentConfig<FooterProps> = {
  label: "Footer",
  fields: footerFields,
  defaultProps: {
    backgroundColor: backgroundColors.background6.value,
    logoWidth: 80,
  },
  inline: true,
  render: (props) => <FooterComponent {...props} />,
};

const FooterComponent: React.FC<WithId<WithPuckProps<FooterProps>>> = (
  props
) => {
  const document: {
    _site?: {
      footer?: {
        linkSections?: FooterLinkSection[];
        images?: ComplexImageType[];
      };
      copyrightMessage?: string;
      logo?: ComplexImageType;
      facebookPageUrl?: string;
      instagramHandle?: string;
      youTubeChannelUrl?: string;
      linkedInUrl?: string;
      twitterHandle?: string;
      pinterestUrl?: string;
      tikTokUrl?: string;
    };
  } = useDocument();
  const { backgroundColor = backgroundColors.background1.value, puck } = props;

  const linkSections = document?._site?.footer?.linkSections;
  const copyrightMessage = document?._site?.copyrightMessage;
  const logo = document?._site?.logo;
  const images = document?._site?.footer?.images;
  const socialLinks = [
    {
      name: "facebook",
      link: document?._site?.facebookPageUrl,
      label: <FaFacebook className="w-5 h-5 mr-4" />,
    },
    {
      name: "instagram",
      prefix: "//www.instagram.com/",
      link: document?._site?.instagramHandle,
      label: <FaInstagram className="w-5 h-5 mr-4" />,
    },
    {
      name: "youtube",
      link: document?._site?.youTubeChannelUrl,
      label: <FaYoutube className="w-5 h-5 mr-4" />,
    },
    {
      name: "linkedIn",
      link: document?._site?.linkedInUrl,
      label: <FaLinkedinIn className="w-5 h-5 mr-4" />,
    },
    {
      name: "twitter",
      prefix: "//www.twitter.com/",
      link: document?._site?.twitterHandle,
      label: <FaTwitter className="w-5 h-5 mr-4" />,
    },
    {
      name: "pinterest",
      link: document?._site?.pinterestUrl,
      label: <FaPinterest className="w-5 h-5 mr-4" />,
    },
    {
      name: "tiktok",
      link: document?._site?.tikTokUrl,
      label: <FaTiktok className="w-5 h-5 mr-4" />,
    },
  ].filter((link) => link.link) as socialLink[];

  return (
    <PageSection
      background={backgroundColor}
      className="flex flex-col"
      outerClassName="mt-auto p-20"
      as="footer"
      ref={puck.dragRef}
    >
      <div className="flex flex-col sm:flex-row justify-between w-full items-center text-body-fontSize font-body-fontFamily mb-10">
        <div className="flex flex-col justify-between items-start gap-8">
          {logo && (
            <EntityField
              displayName="Business Logo"
              fieldId={"site.businessLogo"}
            >
              <div
                className="flex mr-2"
                style={{ width: `${props.logoWidth}px` }}
              >
                <Image
                  image={logo.image}
                  layout="auto"
                  aspectRatio={logo.image.width / logo.image.height}
                />
              </div>
            </EntityField>
          )}
          {socialLinks && (
            <EntityField
              displayName="Footer Social Icons"
              fieldId={"site.footer"}
            >
              <FooterSocialIcons socialLinks={socialLinks} />
            </EntityField>
          )}
          {images && images.length > 0 && (
            <EntityField
              displayName="Footer Images"
              fieldId="site.footer.images"
            >
              <div className="flex justify-between items-center gap-8">
                {images.map((image, idx) => (
                  <Image
                    key={"footerimage" + idx}
                    image={image}
                    layout="auto"
                    aspectRatio={1}
                    className="rounded-full"
                  />
                ))}
              </div>
            </EntityField>
          )}
        </div>
        {linkSections && linkSections.length > 0 && (
          <EntityField displayName="Footer Links" fieldId={"site.footer.links"}>
            <FooterLinks sections={linkSections} />
          </EntityField>
        )}
      </div>
      {copyrightMessage && (
        <div className={`text-body-sm-fontSize text-center sm:text-left `}>
          <EntityField
            displayName="Copyright Text"
            fieldId="site.copyrightMessage"
          >
            <Body variant={"sm"}>{copyrightMessage}</Body>
          </EntityField>
        </div>
      )}
    </PageSection>
  );
};

const FooterLinks = (props: { sections?: FooterLinkSection[] }) => {
  const { sections } = props;

  if (!sections?.length) {
    return;
  }

  return (
    <EntityField displayName="Footer Links" fieldId="site.footer.linkSections">
      {sections.map((section, i) => {
        return (
          <div key={"footersection" + i}>
            <Body>{section.label}</Body>
            {section.links.map((item, j) => {
              return (
                <CTA
                  key={`footerlink-${i}-${j}`}
                  link={item.link}
                  label={item.label}
                  linkType={item.linkType}
                  eventName={`footerlink${i}-${j}`}
                  variant="link"
                  alwaysHideCaret={true}
                  className="sm:pr-8"
                />
              );
            })}
          </div>
        );
      })}
    </EntityField>
  );
};

const FooterSocialIcons = ({ socialLinks }: { socialLinks: socialLink[] }) => {
  return (
    <div className="flex flex-row items-center justify-center sm:justify-end">
      {socialLinks.map((socialLink: socialLink, idx: number) =>
        socialLink.link ? (
          <CTA
            key={idx}
            label={socialLink.label}
            link={`${socialLink.prefix ?? ""}${socialLink.link}`}
            variant={"link"}
            eventName={socialLink.name}
            alwaysHideCaret={true}
            ariaLabel={socialLink.label + " link"}
          />
        ) : null
      )}
    </div>
  );
};

export { Footer, type FooterProps };
