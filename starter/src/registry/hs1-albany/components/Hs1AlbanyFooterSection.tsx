import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";
import { FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";

type LinkItem = {
  label: string;
  link: string;
};

type SocialItem = LinkItem & { icon: "facebook" | "twitter" | "youtube" };

export type Hs1AlbanyFooterSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logo: LinkItem;
  socialLinks: SocialItem[];
};

const iconMap = {
  facebook: FaFacebookF,
  twitter: FaTwitter,
  youtube: FaYoutube,
};

const Hs1AlbanyFooterSectionFields: Fields<Hs1AlbanyFooterSectionProps> = {
  logoImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Logo Image",
    filter: { types: ["type.image"] },
  }),
  logo: {
    label: "Logo",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  socialLinks: {
    label: "Social Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      icon: {
        label: "Icon",
        type: "select",
        options: [
          { label: "Facebook", value: "facebook" },
          { label: "Twitter", value: "twitter" },
          { label: "Youtube", value: "youtube" },
        ],
      },
    },
    defaultItemProps: {
      label: "Social",
      link: "#",
      icon: "facebook",
    },
    getItemSummary: (item) => item.label,
  },
};

export const Hs1AlbanyFooterSectionComponent: PuckComponent<
  Hs1AlbanyFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const logoImage = resolveComponentData(
    props.logoImage,
    locale,
    streamDocument,
  );

  return (
    <section className="bg-white px-6 py-8">
      <div className="mx-auto flex max-w-[1170px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Link
          cta={{ link: props.logo.link, linkType: "URL" }}
          className="flex items-center gap-4 no-underline"
        >
          {logoImage ? (
            <div className="w-[120px] [&_img]:h-auto [&_img]:w-full">
              <Image image={logoImage} />
            </div>
          ) : null}
          <span
            className="text-sm uppercase tracking-[0.22em] text-[#7f7f7f]"
            style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
          >
            {props.logo.label}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {props.socialLinks.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={`${item.label}-${item.link}`}
                cta={{ link: item.link, linkType: "URL" }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcb65f] text-white no-underline"
              >
                <Icon />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyFooterSection: ComponentConfig<Hs1AlbanyFooterSectionProps> =
  {
    label: "HS1 Albany Footer Section",
    fields: Hs1AlbanyFooterSectionFields,
    defaultProps: {
      logoImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/120x78_80/webmgr/1o/u/o/brooklyn/sunnysmileslogo.png.webp?60c03c38fcebb177765418932264c8d5",
          width: 120,
          height: 78,
        },
        constantValueEnabled: true,
      },
      logo: {
        label: "Sunny Smiles",
        link: "https://www.ofc-albany.com",
      },
      socialLinks: [
        {
          label: "Facebook",
          link: "https://www.facebook.com/Anderson-Optometry-363713737059041/",
          icon: "facebook",
        },
        {
          label: "Twitter",
          link: "https://twitter.com/InternetMatrix",
          icon: "twitter",
        },
        {
          label: "Youtube",
          link: "https://www.youtube.com/user/webmarketingimatrix",
          icon: "youtube",
        },
      ],
    },
    render: Hs1AlbanyFooterSectionComponent,
  };
