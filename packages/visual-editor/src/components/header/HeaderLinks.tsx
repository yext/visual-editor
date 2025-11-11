import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import {
  CTA,
  msg,
  pt,
  resolveComponentData,
  TranslatableCTA,
  useDocument,
  YextField,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../atoms/dropdown";
import { FaBars } from "react-icons/fa6";
import { linkTypeOptions } from "../../internal/puck/constant-value-fields/CallToAction";

export type HeaderLinksProps = {
  data: {
    links: TranslatableCTA[];
  };

  /** @internal data from the parent section */
  parentData?: {
    type: "Primary" | "Secondary";
  };
};

const defaultLink: TranslatableCTA = {
  linkType: "URL",
  label: { en: "Header Link", hasLocalizedValue: "true" },
  link: "#",
};

const headerLinksFields: Fields<HeaderLinksProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      links: YextField(msg("fields.links", "Links"), {
        type: "array",
        arrayFields: {
          label: YextField(msg("fields.label", "Label"), {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
          link: YextField(msg("fields.link", "Link"), {
            type: "text",
          }),
          linkType: {
            label: pt("fields.linkType", "Link Type"),
            type: "select",
            options: linkTypeOptions(),
          },
        },
        defaultItemProps: defaultLink satisfies TranslatableCTA,
        getItemSummary: (item, i) => {
          const { i18n } = useTranslation();
          return (
            resolveComponentData(item.label, i18n.language) ||
            pt("Link", "Link") + " " + ((i ?? 0) + 1)
          );
        },
      }),
    },
  }),
};

const HeaderLinksComponent: PuckComponent<HeaderLinksProps> = ({
  data,
  parentData,
  puck,
}) => {
  const { i18n, t } = useTranslation();
  const streamDocument = useDocument();
  const MAX_VISIBLE = 5;
  const type = parentData?.type || "Primary";
  const isSecondary = type === "Secondary";

  const renderLink = (
    item: TranslatableCTA,
    index: number,
    ctaType: string
  ) => (
    <CTA
      variant={
        type === "Primary"
          ? "headerFooterMainLink"
          : "headerFooterSecondaryLink"
      }
      eventName={`cta.${ctaType}.${index}`}
      label={resolveComponentData(item.label, i18n.language, streamDocument)}
      linkType={item.linkType}
      link={resolveComponentData(item.link, i18n.language, streamDocument)}
      className="justify-start w-full text-left"
    />
  );

  const validLinks = data.links?.filter((item) => !!item?.link) || [];

  if (validLinks.length === 0) {
    if (puck.isEditing) {
      return (
        <nav
          aria-label={
            type === "Primary"
              ? t("primaryHeaderLinks", "Primary Header Links")
              : t("secondaryHeaderLinks", "Secondary Header Links")
          }
        >
          <ul className="flex flex-col md:flex-row gap-0 md:gap-6 md:items-center">
            <li className="py-4 md:py-0">
              <div className="h-5 min-w-[100px]" />
            </li>
          </ul>
        </nav>
      );
    }
    return <></>;
  }

  return (
    <nav
      aria-label={
        type === "Primary"
          ? t("primaryHeaderLinks", "Primary Header Links")
          : t("secondaryHeaderLinks", "Secondary Header Links")
      }
    >
      <ul className="flex flex-col md:flex-row gap-0 md:gap-6 md:items-center">
        {validLinks.map((item, index) => {
          const isOverflowed = isSecondary && index >= MAX_VISIBLE;
          return (
            <li
              key={`${type.toLowerCase()}.${index}`}
              className={`py-4 md:py-0 ${isOverflowed ? "md:hidden" : ""}`}
            >
              {renderLink(item, index, type.toLowerCase())}
            </li>
          );
        })}

        {isSecondary && validLinks.length > MAX_VISIBLE && (
          <li className="hidden md:block py-4 md:py-0">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex flex-row md:items-center gap-4 justify-between w-full">
                <div className="flex gap-4 items-center">
                  <FaBars />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border rounded shadow-md p-2 min-w-[200px] z-[9999]">
                {validLinks.slice(MAX_VISIBLE).map((item, index) => (
                  <DropdownMenuItem
                    key={`overflow-${index}`}
                    className="cursor-pointer p-2 text-body-sm-fontSize hover:bg-gray-100"
                  >
                    {renderLink(item, index + MAX_VISIBLE, "overflow")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )}
      </ul>
    </nav>
  );
};

export const defaultHeaderLinkProps: HeaderLinksProps = {
  data: {
    links: [defaultLink, defaultLink, defaultLink],
  },
};

export const HeaderLinks: ComponentConfig<{ props: HeaderLinksProps }> = {
  label: msg("components.headerLinks", "Header Links"),
  fields: headerLinksFields,
  defaultProps: defaultHeaderLinkProps,
  render: (props) => <HeaderLinksComponent {...props} />,
};
