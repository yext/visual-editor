import { useTranslation } from "react-i18next";
import * as React from "react";
import { AnalyticsScopeProvider, CTA as CTAType } from "@yext/pages-components";
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
  msg,
  pt,
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

export interface FooterProps {
  /**
   * The background color for the entire footer section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /** @internal */
  analytics?: {
    scope?: string;
  };
}

const footerFields: Fields<FooterProps> = {
  backgroundColor: YextField(
    msg("fields.backgroundColor", "Background Color"),
    {
      type: "select",
      options: "BACKGROUND_COLOR",
    }
  ),
};

/**
 * The Footer appears at the bottom of the page. It serves as a container for secondary navigation, social media links, legal disclaimers, and copyright information. See [Expanded Footer](#expanded-footer) for the newest footer component.
 * Avaliable on Directory and Locator templates.
 */
export const Footer: ComponentConfig<FooterProps> = {
  label: msg("components.footer", "Footer"),
  fields: footerFields,
  defaultProps: {
    backgroundColor: backgroundColors.background1.value,
    analytics: {
      scope: "footer",
    },
  },
  inline: true,
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "footer"}>
      <FooterComponent {...props} />
    </AnalyticsScopeProvider>
  ),
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
    <PageSection
      background={backgroundColor}
      className="flex flex-col"
      outerClassName="mt-auto"
      as="footer"
      ref={puck.dragRef}
    >
      <div className="flex flex-col sm:flex-row justify-between w-full items-center text-body-fontSize font-body-fontFamily">
        {links && (
          <EntityField
            displayName={pt("fields.footerLinks", "Footer Links")}
            fieldId={"site.footer.links"}
          >
            <FooterLinks links={links} />
          </EntityField>
        )}
        {socialLinks && (
          <EntityField
            displayName={pt("fields.footerSocialIcons", "Footer Social Icons")}
            fieldId={"site.footer"}
          >
            <FooterSocialIcons socialLinks={socialLinks} />
          </EntityField>
        )}
      </div>
      {copyrightMessage && (
        <div className={`text-body-sm-fontSize text-center sm:text-left `}>
          <EntityField
            displayName={pt("fields.copyrightText", "Copyright Text")}
            fieldId="site.copyrightMessage"
          >
            <Body>{copyrightMessage}</Body>
          </EntityField>
        </div>
      )}
    </PageSection>
  );
};

const FooterLinks = (props: { links: CTAType[] }) => {
  return (
    <ul className="flex flex-col sm:flex-row items-center pb-4">
      {props.links
        .filter((item) => !!item?.link)
        .map((item, idx) => (
          <li key={item.link}>
            <CTA
              link={item.link}
              label={item.label}
              linkType={item.linkType}
              eventName={`link${idx}`}
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-row items-center justify-center sm:justify-end pb-4">
      {socialLinks.map((socialLink: socialLink, idx: number) =>
        socialLink.link ? (
          <CTA
            key={idx}
            label={socialLink.label}
            link={`${socialLink.prefix ?? ""}${socialLink.link}`}
            variant={"link"}
            eventName={`socialLink${idx}`}
            alwaysHideCaret={true}
            // TODO: translation concatenation
            ariaLabel={socialLink.label + " " + t("link", "link")}
          />
        ) : null
      )}
    </div>
  );
};
