import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import { YextField, msg } from "@yext/visual-editor";
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

  const links = [
    { url: data.xLink, icon: FaXTwitter, pattern: validPatterns.xLink },
    {
      url: data.facebookLink,
      icon: FaFacebook,
      pattern: validPatterns.facebookLink,
    },
    {
      url: data.instagramLink,
      icon: FaInstagram,
      pattern: validPatterns.instagramLink,
    },
    {
      url: data.pinterestLink,
      icon: FaPinterest,
      pattern: validPatterns.pinterestLink,
    },
    {
      url: data.linkedInLink,
      icon: FaLinkedinIn,
      pattern: validPatterns.linkedInLink,
    },
    {
      url: data.youtubeLink,
      icon: FaYoutube,
      pattern: validPatterns.youtubeLink,
    },
    { url: data.tiktokLink, icon: FaTiktok, pattern: validPatterns.tiktokLink },
  ];

  const validLinks = links.filter(
    (link) => link.url && link.pattern.test(link.url)
  );

  // Always show placeholder in editing mode, hide on live if empty
  if (validLinks.length === 0) {
    return puck.isEditing ? <div className="h-10 min-w-[100px]" /> : <></>;
  }

  return (
    <div className="flex gap-4 items-center justify-center md:justify-start">
      {validLinks.map((link, index) => {
        const Icon = link.icon;
        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl hover:opacity-80 transition-opacity"
          >
            <Icon />
          </a>
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
