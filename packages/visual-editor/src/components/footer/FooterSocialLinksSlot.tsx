import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import { YextField, msg, CTA } from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPinterest,
  FaTiktok,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { validPatterns } from "./ExpandedFooter";

export interface FooterSocialLinksSlotProps {
  data: {
    xLink: string;
    facebookLink: string;
    instagramLink: string;
    linkedInLink: string;
    pinterestLink: string;
    tiktokLink: string;
    youtubeLink: string;
  };
}

const FooterSocialLinksSlotInternal: PuckComponent<
  FooterSocialLinksSlotProps
> = (props) => {
  const { data, puck } = props;
  const { t } = useTranslation();

  const links = [
    {
      url: data.xLink,
      icon: FaXTwitter,
      pattern: validPatterns.xLink,
      label: "X (Twitter)",
    },
    {
      url: data.facebookLink,
      icon: FaFacebook,
      pattern: validPatterns.facebookLink,
      label: "Facebook",
    },
    {
      url: data.instagramLink,
      icon: FaInstagram,
      pattern: validPatterns.instagramLink,
      label: "Instagram",
    },
    {
      url: data.pinterestLink,
      icon: FaPinterest,
      pattern: validPatterns.pinterestLink,
      label: "Pinterest",
    },
    {
      url: data.linkedInLink,
      icon: FaLinkedinIn,
      pattern: validPatterns.linkedInLink,
      label: "LinkedIn",
    },
    {
      url: data.youtubeLink,
      icon: FaYoutube,
      pattern: validPatterns.youtubeLink,
      label: "YouTube",
    },
    {
      url: data.tiktokLink,
      icon: FaTiktok,
      pattern: validPatterns.tiktokLink,
      label: "TikTok",
    },
  ];

  const validLinks = links.filter(
    (link) => link.url && link.pattern.test(link.url)
  );

  // Always show placeholder in editing mode, hide on live if empty
  if (validLinks.length === 0) {
    return puck.isEditing ? <div className="h-10 min-w-[100px]" /> : <></>;
  }

  return (
    <div className="flex gap-6 items-center justify-center md:justify-start">
      {validLinks.map((link, index) => {
        const Icon = link.icon;
        const iconElement = <Icon className="h-6 w-6 md:h-5 md:w-5" />;
        return (
          <CTA
            key={index}
            label={iconElement}
            link={link.url}
            linkType="URL"
            variant="link"
            eventName={`socialLink.${link.label.toLowerCase()}`}
            ariaLabel={`${link.label} ${t("link", "link")}`}
            alwaysHideCaret
            className="block break-words whitespace-normal"
          />
        );
      })}
    </div>
  );
};

export const FooterSocialLinksSlot: ComponentConfig<{
  props: FooterSocialLinksSlotProps;
}> = {
  label: msg("components.footerSocialLinksSlot", "Social Links"),
  fields: {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
        xLink: YextField(msg("fields.xLink", "X Link"), {
          type: "text",
        }),
        facebookLink: YextField(msg("fields.facebookLink", "Facebook Link"), {
          type: "text",
        }),
        instagramLink: YextField(
          msg("fields.instagramLink", "Instagram Link"),
          {
            type: "text",
          }
        ),
        linkedInLink: YextField(msg("fields.linkedInLink", "LinkedIn Link"), {
          type: "text",
        }),
        pinterestLink: YextField(
          msg("fields.pinterestLink", "Pinterest Link"),
          {
            type: "text",
          }
        ),
        tiktokLink: YextField(msg("fields.tiktokLink", "TikTok Link"), {
          type: "text",
        }),
        youtubeLink: YextField(msg("fields.youtubeLink", "YouTube Link"), {
          type: "text",
        }),
      },
    }),
  },
  defaultProps: {
    data: {
      xLink: "",
      facebookLink: "",
      instagramLink: "",
      linkedInLink: "",
      pinterestLink: "",
      tiktokLink: "",
      youtubeLink: "",
    },
  },
  render: (props) => <FooterSocialLinksSlotInternal {...props} />,
};
