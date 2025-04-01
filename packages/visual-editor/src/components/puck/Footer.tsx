import * as React from "react";
import { Link, CTA as CTAType } from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  Body,
  EntityField,
  themeManagerCn,
  useDocument,
  BasicSelector,
  CTA,
  type BackgroundStyle,
  backgroundColors,
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
    Object.values(backgroundColors).map(({ label, value }) => ({
      label,
      value,
      color: value.bgColor,
    }))
  ),
};

const Footer: ComponentConfig<FooterProps> = {
  fields: footerFields,
  defaultProps: {
    backgroundColor: backgroundColors.background1.value,
  },
  label: "Footer",
  render: (props) => <FooterComponent {...props} />,
};

const FooterComponent: React.FC<FooterProps> = (props) => {
  const document = useDocument<any>();
  const { backgroundColor } = props;

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
    <footer
      className={themeManagerCn(
        "w-full bg-white components",
        backgroundColor?.bgColor
      )}
    >
      <div className="container mx-auto flex flex-col px-4 pt-4 pb-3">
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
            className={`text-body-sm-fontSize text-center sm:text-left ${backgroundColor?.textColor}`}
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
            className="pr-8"
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
          <Link
            key={idx}
            href={`${socialLink.prefix ?? ""}${socialLink.link}`}
            eventName={socialLink.name}
          >
            {socialLink.label}
          </Link>
        ) : null
      )}
    </div>
  );
};

export { Footer, type FooterProps };
