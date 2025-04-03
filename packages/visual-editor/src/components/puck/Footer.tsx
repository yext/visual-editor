import * as React from "react";
import { CTA as CTAType } from "@yext/pages-components";
import { ComponentConfig, Fields, WithId, WithPuckProps } from "@measured/puck";
import {
  Body,
  EntityField,
  themeManagerCn,
  useDocument,
  BasicSelector,
  CTA,
  type BackgroundStyle,
  backgroundColors,
  ThemeOptions,
  BackgroundProvider,
} from "../../index.ts";
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

type FooterProps = {
  backgroundColor?: BackgroundStyle;
};

const footerFields: Fields<FooterProps> = {
  backgroundColor: BasicSelector(
    "Background Color",
    ThemeOptions.BACKGROUND_COLOR
  ),
};

const Footer: ComponentConfig<FooterProps> = {
  label: "Footer",
  fields: footerFields,
  defaultProps: {
    backgroundColor: backgroundColors.background1.value,
  },
  inline: true,
  render: (props) => <FooterComponent {...props} />,
};

const FooterComponent: React.FC<WithId<WithPuckProps<FooterProps>>> = (
  props
) => {
  const document = useDocument<any>();
  const { backgroundColor = backgroundColors.background1.value, puck } = props;

  const links = document?._site?.footer?.links ?? [];
  const copyrightMessage = document?._site?.copyrightMessage;
  const socialLinks: socialLink[] = [
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
  ].filter((link) => link.link);

  return (
    <BackgroundProvider value={backgroundColor}>
      <footer
        className={themeManagerCn(
          "w-full bg-white components",
          backgroundColor.bgColor,
          "mt-auto"
        )}
        ref={puck.dragRef}
      >
        <div className="container mx-auto flex flex-col py-8 sm:py-20 mx-auto max-w-pageSection-contentWidth">
          <div className="flex flex-col sm:flex-row justify-between w-full items-center text-body-fontSize font-body-fontFamily">
            {links && (
              <EntityField
                displayName="Footer Links"
                fieldId={"site.footer.links"}
              >
                <FooterLinks links={links} />
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
          </div>
          {copyrightMessage && (
            <div
              className={`text-body-sm-fontSize text-center sm:text-left ${backgroundColor.textColor}`}
            >
              <EntityField
                displayName="Copyright Text"
                fieldId="site.copyrightMessage"
              >
                <Body>{copyrightMessage}</Body>
              </EntityField>
            </div>
          )}
        </div>
      </footer>
    </BackgroundProvider>
  );
};

const FooterLinks = (props: { links: CTAType[] }) => {
  return (
    <ul className="flex flex-col sm:flex-row items-center pb-4">
      {props.links.map((item, idx) => (
        <li key={item.link}>
          <CTA
            link={item.link}
            label={item.label}
            linkType={item.linkType}
            eventName={`footerlink${idx}`}
            variant="link"
            alwaysHideCaret={true}
            className="sm:pr-8"
          />
        </li>
      ))}
    </ul>
  );
};

const FooterSocialIcons = ({ socialLinks }: { socialLinks: socialLink[] }) => {
  return (
    <div className="flex flex-row items-center justify-center sm:justify-end pb-4">
      {socialLinks.map((socialLink: socialLink, idx: number) =>
        socialLink.link ? (
          <CTA
            key={idx}
            label={socialLink.label}
            link={`${socialLink.prefix ?? ""}${socialLink.link}`}
            variant={"link"}
            eventName={socialLink.name}
            alwaysHideCaret={true}
          />
        ) : null
      )}
    </div>
  );
};

export { Footer, type FooterProps };
