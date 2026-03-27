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

type LinkItem = {
  label: string;
  link: string;
};

type ServiceCard = {
  title: LinkItem;
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
};

export type Hs1AlbanyServicesSectionProps = {
  cards: ServiceCard[];
};

const imageField = YextEntityFieldSelector<
  any,
  ImageType | ComplexImageType | TranslatableAssetImage
>({
  label: "Image",
  filter: {
    types: ["type.image"],
  },
});

const imageDefault = (url: string, width: number, height: number) => ({
  field: "",
  constantValue: {
    url,
    width,
    height,
  },
  constantValueEnabled: true,
});

const Hs1AlbanyServicesSectionFields: Fields<Hs1AlbanyServicesSectionProps> = {
  cards: {
    label: "Cards",
    type: "array",
    arrayFields: {
      title: {
        label: "Title",
        type: "object",
        objectFields: {
          label: { label: "Label", type: "text" },
          link: { label: "Link", type: "text" },
        },
      },
      image: imageField,
    },
    defaultItemProps: {
      title: {
        label: "Service",
        link: "#",
      },
      image: imageDefault(
        "https://cdcssl.ibsrv.net/ibimg/smb/767x511_80/webmgr/1o/u/o/Callouts-LRG/50953800921_4eb88794af_k.jpg.webp?92f0e12a819db83dfd6fbfbdf24a72c1",
        767,
        511,
      ),
    },
    getItemSummary: (item) => item.title.label,
  },
};

export const Hs1AlbanyServicesSectionComponent: PuckComponent<
  Hs1AlbanyServicesSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  return (
    <section className="bg-[#4f4e4e]">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {props.cards.map((card) => {
          const resolvedImage = resolveComponentData(
            card.image,
            locale,
            streamDocument,
          );

          return (
            <div
              key={`${card.title.label}-${card.title.link}`}
              className="relative min-h-[298px] overflow-hidden"
            >
              {resolvedImage ? (
                <div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                  <Image image={resolvedImage} />
                </div>
              ) : null}
              <div className="absolute inset-0 bg-[#4f4e4e]/50" />
              <div className="relative flex min-h-[298px] items-center justify-center px-6 py-8 text-center">
                <Link
                  cta={{
                    link: card.title.link,
                    linkType: "URL",
                  }}
                >
                  <span
                    className="block text-xl uppercase tracking-[0.08em] text-white"
                    style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
                  >
                    {card.title.label}
                  </span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const Hs1AlbanyServicesSection: ComponentConfig<Hs1AlbanyServicesSectionProps> =
  {
    label: "HS1 Albany Services Section",
    fields: Hs1AlbanyServicesSectionFields,
    defaultProps: {
      cards: [
        {
          title: {
            label: "General Dentistry",
            link: "https://www.ofc-albany.com/dental-services",
          },
          image: imageDefault(
            "https://cdcssl.ibsrv.net/ibimg/smb/767x511_80/webmgr/1o/u/o/Callouts-LRG/50953800921_4eb88794af_k.jpg.webp?92f0e12a819db83dfd6fbfbdf24a72c1",
            767,
            511,
          ),
        },
        {
          title: {
            label: "Orthodontics",
            link: "https://www.ofc-albany.com/dental-services",
          },
          image: imageDefault(
            "https://cdcssl.ibsrv.net/ibimg/smb/767x511_80/webmgr/1o/u/o/Callouts-LRG/51252077283_abf09d8040_k.jpg.webp?a90db7574dfcb4aa7099afd15d5615c0",
            767,
            511,
          ),
        },
        {
          title: {
            label: "Cosmetic Dentistry",
            link: "https://www.ofc-albany.com/contact",
          },
          image: imageDefault(
            "https://cdcssl.ibsrv.net/ibimg/smb/767x511_80/webmgr/1o/u/o/Callouts-LRG/48799307661_6d64d077e0_k.jpg.webp?38117236c475292e996719f4e87e34a6",
            767,
            511,
          ),
        },
      ],
    },
    render: Hs1AlbanyServicesSectionComponent,
  };
