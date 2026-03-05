// @ts-nocheck
import * as React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { YextField } from "../ve.ts";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPinterest,
  FaTiktok,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const validPatterns = {
  xLink: /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/.+/i,
  facebookLink: /^(https?:\/\/)?(www\.)?facebook\.com\/.+/i,
  instagramLink: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i,
  linkedInLink: /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i,
  pinterestLink: /^(https?:\/\/)?(www\.)?pinterest\.com\/.+/i,
  tiktokLink: /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/i,
  youtubeLink: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i,
};

export interface YetiFooterSocialLinksSlotProps {
  data: {
    xLink: string;
    facebookLink: string;
    instagramLink: string;
    linkedInLink: string;
    pinterestLink: string;
    tiktokLink: string;
    youtubeLink: string;
  };
  styles: {
    mobileAlignment: "left" | "center";
  };
}

const fields: Fields<YetiFooterSocialLinksSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      xLink: YextField("X Link", { type: "text" }),
      facebookLink: YextField("Facebook Link", { type: "text" }),
      instagramLink: YextField("Instagram Link", { type: "text" }),
      linkedInLink: YextField("LinkedIn Link", { type: "text" }),
      pinterestLink: YextField("Pinterest Link", { type: "text" }),
      tiktokLink: YextField("TikTok Link", { type: "text" }),
      youtubeLink: YextField("YouTube Link", { type: "text" }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      mobileAlignment: YextField("Mobile Alignment", {
        type: "radio",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
        ],
      }),
    },
  }),
};

type SocialLink = {
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  pattern: RegExp;
  label: string;
};

const YetiFooterSocialLinksSlotComponent: PuckComponent<
  YetiFooterSocialLinksSlotProps
> = ({ data, styles, puck }) => {
  const links: SocialLink[] = [
    {
      url: data.xLink,
      icon: FaXTwitter,
      pattern: validPatterns.xLink,
      label: "X",
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
      url: data.linkedInLink,
      icon: FaLinkedinIn,
      pattern: validPatterns.linkedInLink,
      label: "LinkedIn",
    },
    {
      url: data.pinterestLink,
      icon: FaPinterest,
      pattern: validPatterns.pinterestLink,
      label: "Pinterest",
    },
    {
      url: data.tiktokLink,
      icon: FaTiktok,
      pattern: validPatterns.tiktokLink,
      label: "TikTok",
    },
    {
      url: data.youtubeLink,
      icon: FaYoutube,
      pattern: validPatterns.youtubeLink,
      label: "YouTube",
    },
  ].filter((link) => link.url && link.pattern.test(link.url));

  if (!links.length) {
    return puck.isEditing ? <div className="h-10" /> : null;
  }

  return (
    <div
      className={`flex flex-wrap gap-4 ${styles.mobileAlignment === "left" ? "justify-start" : "justify-center"} md:justify-start`}
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            className="inline-flex h-10 w-10 items-center justify-center border border-current/35"
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
};

export const defaultYetiFooterSocialLinksSlotProps: YetiFooterSocialLinksSlotProps =
  {
    data: {
      xLink: "",
      facebookLink: "https://www.facebook.com/Yeti/",
      instagramLink: "https://www.instagram.com/yeti",
      linkedInLink: "",
      pinterestLink: "",
      tiktokLink: "https://www.tiktok.com/@yeti",
      youtubeLink: "https://www.youtube.com/channel/UCAZ5PoEUL2_clEdDBrFF-aQ",
    },
    styles: {
      mobileAlignment: "left",
    },
  };

export const YetiFooterSocialLinksSlot: ComponentConfig<{
  props: YetiFooterSocialLinksSlotProps;
}> = {
  label: "Yeti Footer Social Links Slot",
  fields,
  defaultProps: defaultYetiFooterSocialLinksSlotProps,
  render: (props) => <YetiFooterSocialLinksSlotComponent {...props} />,
};
