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

type QuickLinkCard = {
  title: string;
  link: string;
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
};

export type Hs1CarmelQuickLinksSectionProps = {
  cards: QuickLinkCard[];
};

const Hs1CarmelQuickLinksSectionFields: Fields<Hs1CarmelQuickLinksSectionProps> =
  {
    cards: {
      label: "Cards",
      type: "array",
      arrayFields: {
        title: { label: "Title", type: "text" },
        link: { label: "Link", type: "text" },
        image: YextEntityFieldSelector<
          any,
          ImageType | ComplexImageType | TranslatableAssetImage
        >({
          label: "Image",
          filter: {
            types: ["type.image"],
          },
        }),
      },
      defaultItemProps: {
        title: "Quick Link",
        link: "#",
        image: {
          field: "",
          constantValue: {
            url: "https://placehold.co/1200x800",
            width: 1200,
            height: 800,
          },
          constantValueEnabled: true,
        },
      },
      getItemSummary: (item: QuickLinkCard) => item.title || "Card",
    },
  };

export const Hs1CarmelQuickLinksSectionComponent: PuckComponent<
  Hs1CarmelQuickLinksSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  return (
    <section className="relative bg-[#04364E] px-4 pb-16 pt-10 text-white lg:px-6">
      <div className="absolute inset-x-0 top-0 -translate-y-full text-[#04364E]">
        <svg
          viewBox="0 0 100.1 5.2"
          preserveAspectRatio="none"
          className="h-10 w-full"
        >
          <path
            fill="currentColor"
            d="M100.1,4.7C53.7-9.4,38.6,13.9,0,0l0,5.2h100.1"
          />
        </svg>
      </div>
      <div className="mx-auto grid max-w-[1140px] gap-5 md:grid-cols-2 xl:grid-cols-4">
        {props.cards.map((card) => {
          const resolvedImage = resolveComponentData(
            card.image,
            locale,
            streamDocument,
          );

          return (
            <Link
              key={`${card.title}-${card.link}`}
              cta={{
                link: card.link,
                linkType: "URL",
              }}
              className="group relative min-h-[18rem] overflow-hidden border border-white/20 text-center no-underline"
            >
              {resolvedImage && (
                <Image
                  image={resolvedImage}
                  className="absolute inset-0 h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-white/80 transition duration-300 group-hover:bg-[#04364E]/82" />
              <div className="relative flex h-full items-center justify-center p-8">
                <h3 className="m-0 font-['Poppins','Open_Sans',sans-serif] text-[20px] font-bold leading-6 text-[#04364E] transition group-hover:text-white">
                  {card.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export const Hs1CarmelQuickLinksSection: ComponentConfig<Hs1CarmelQuickLinksSectionProps> =
  {
    label: "HS1 Carmel Quick Links Section",
    fields: Hs1CarmelQuickLinksSectionFields,
    defaultProps: {
      cards: [
        {
          title: "Meet The Doctor",
          link: "https://www.ofc-carmel.com/staff",
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/2048x1367_80/webmgr/1s/a/7/Sample-Images/52099170678_ab9962ff94_k.jpg.webp?b33a79cbbdca0e7301f0aad01d65cb33",
              width: 2048,
              height: 1367,
            },
            constantValueEnabled: true,
          },
        },
        {
          title: "Meet The Team",
          link: "https://www.ofc-carmel.com/staff",
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/2048x1385_80/webmgr/1s/a/7/Sample-Images/51874984177_ecbe0db1a4_k.jpg.webp?6d7581a21f9172a49e0a79928589b133",
              width: 2048,
              height: 1385,
            },
            constantValueEnabled: true,
          },
        },
        {
          title: "Our Office",
          link: "https://www.ofc-carmel.com/our-locations",
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/2048x1367_80/webmgr/1s/a/7/Sample-Images/52387318393_008419d7e0_k.jpg.webp?245679b6a08e141b79cd1adb05b548eb",
              width: 2048,
              height: 1367,
            },
            constantValueEnabled: true,
          },
        },
        {
          title: "Schedule An Appointment",
          link: "https://www.ofc-carmel.com/appointment",
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/2048x1366_80/webmgr/1s/a/7/Sample-Images/52249268666_e0b46b5dc0_k.jpg.webp?929286131b8f7c37c456389d7e35712e",
              width: 2048,
              height: 1366,
            },
            constantValueEnabled: true,
          },
        },
      ],
    },
    render: Hs1CarmelQuickLinksSectionComponent,
  };
