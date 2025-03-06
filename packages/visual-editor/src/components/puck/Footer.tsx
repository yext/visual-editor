import * as React from "react";
import { Link, CTA } from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import { Body, EntityField, themeManagerCn, useDocument } from "../../index.ts";
import { BasicSelector } from "../editor/BasicSelector.tsx";
import { cva, VariantProps } from "class-variance-authority";
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

const footerVariants = cva("", {
  variants: {
    backgroundColor: {
      default: "bg-footer-backgroundColor",
      primary: "bg-palette-primary",
      secondary: "bg-palette-secondary",
      accent: "bg-palette-accent",
      text: "bg-palette-text",
      background: "bg-palette-background",
    },
  },
  defaultVariants: {
    backgroundColor: "default",
  },
});

type FooterProps = VariantProps<typeof footerVariants>;

const footerFields: Fields<FooterProps> = {
  backgroundColor: BasicSelector("Background Color", [
    { label: "Default", value: "default" },
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Accent", value: "accent" },
    { label: "Text", value: "text" },
    { label: "Background", value: "background" },
  ]),
};

const Footer: ComponentConfig<FooterProps> = {
  fields: footerFields,
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
      name: "titok",
      link: document?._site?.tikTokUrl,
      label: <FaTiktok className="w-5 h-5 mr-4" />,
    },
  ].filter((link) => link.link);

  return (
    <footer
      className={themeManagerCn(
        "w-full bg-white components",
        footerVariants({ backgroundColor })
      )}
    >
      <div className="container mx-auto flex flex-col px-4 pt-4 pb-3">
        <div className="flex flex-col sm:flex-row justify-between w-full items-center text-footer-linkColor text-footer-linkFontSize font-body-fontFamily">
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
          <div className="text-body-fontSize text-body-color text-center sm:text-left">
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

const FooterLinks = (props: { links: CTA[] }) => {
  return (
    <ul className="flex flex-col sm:flex-row items-center pb-4">
      {props.links.map((item: CTA, idx) => (
        <li key={item.link}>
          <Link
            className="mr-4 lg:mr-10 hover:underline mb-4 sm:mb-0"
            cta={item}
            eventName={`footerlink${idx}`}
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
            href={`${socialLink.prefix}${socialLink.link}`}
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
