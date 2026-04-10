import { Address, getDirections } from "@yext/pages-components";
import { CardProps } from "@yext/search-ui-react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../atoms/accordion.tsx";
import { CTA } from "../../atoms/cta.tsx";
import { HoursStatusAtom } from "../../atoms/hoursStatus.tsx";
import { MaybeRTF } from "../../atoms/maybeRTF.tsx";
import { PhoneAtom } from "../../atoms/phone.tsx";
import {
  CardTypeProp,
  FLEX_LAYOUT_CLASSES,
  HeadingStyles,
  SearchCtaStyles,
  UNIT_LABEL,
  VerticalLayout,
} from "./defaultPropsAndTypes.ts";
import { Background } from "../../atoms/background.tsx";
import { backgroundColors } from "../../../utils/themeConfigOptions.ts";
import { Heading } from "../../atoms/heading.tsx";

interface CardsProps extends CardProps<any> {
  cardType?: CardTypeProp;
  layout?: VerticalLayout;
  isVertical?: boolean;
  index?: number;
  ctaStyles?: SearchCtaStyles;
  headingStyles?: HeadingStyles;
}

const Cards = ({
  result,
  cardType = "Standard",
  layout,
  isVertical = false,
  index = 0,
  ctaStyles,
  headingStyles,
}: CardsProps) => {
  const name = result.rawData.question || result.rawData.name;
  const { t } = useTranslation();
  const nIndex = result.index ?? index;
  const description =
    result.rawData.answerV2 ||
    result.rawData.richTextDescriptionV2 ||
    result.rawData.bodyV2 ||
    result.rawData.description;

  let content;

  if (layout === "Map") {
    const displayDistance =
      typeof result.distance === "number"
        ? `${result.distance} ${UNIT_LABEL}`
        : undefined;

    content = (
      <div className={FLEX_LAYOUT_CLASSES}>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Background
              background={backgroundColors.background6.value}
              className="flex-shrink-0 w-6 h-6 rounded-full font-bold hidden md:flex items-center justify-center text-body-sm-fontSize"
            >
              {nIndex}
            </Background>
            <Heading
              color={headingStyles?.color}
              className="font-bold text-palette-primary-dark"
              level={headingStyles?.headingLevel ?? 3}
            >
              {name ?? "name"}
            </Heading>
          </div>
          {displayDistance && (
            <div className="font-light">{displayDistance} </div>
          )}
        </div>
        <div
          className={`flex gap-4 justify-between ${isVertical ? `flex-col` : `flex-row`}`}
        >
          <div className={`flex ${isVertical ? `flex-col` : `flex-row`}`}>
            <div className={`flex flex-col  ${isVertical ? `w-full` : `w-52`}`}>
              <Address
                address={result.rawData.address}
                lines={[
                  ["line1"],
                  //@ts-ignore
                  ["city", ", ", "region", " ", "postalCode"],
                ]}
              />
              <div className="font-bold">
                <PhoneAtom
                  phoneNumber={result.rawData.mainPhone}
                  format={"domestic"}
                  includeHyperlink={false}
                  includeIcon={false}
                />
              </div>
            </div>
            <div className={`${isVertical ? `w-full` : `w-80`}`}>
              <HoursStatusAtom hours={result.rawData.hours} />
            </div>
          </div>
          <div
            className={`${FLEX_LAYOUT_CLASSES} gap-2 ${isVertical ? `items-start` : `items-end`}`}
          >
            <CTA
              color={ctaStyles?.background}
              textColor={ctaStyles?.textColor}
              link={result.rawData.slug}
              label={t("visitPage", "Visit Page")}
              variant={"primary"}
              className="!w-52 justify-center"
              normalizeLink={true}
            />
            <CTA
              color={ctaStyles?.background}
              textColor={ctaStyles?.textColor}
              link={getDirections(result.rawData.address)}
              label={t("getDirections", "Get Directions")}
              variant={"primary"}
              className="!w-52 justify-center"
              normalizeLink={true}
            />
          </div>
        </div>
      </div>
    );
  } else if (cardType === "Standard") {
    content = (
      <div
        className={`${FLEX_LAYOUT_CLASSES} justify-center text-[#382e2c] gap-2`}
      >
        <Heading
          color={headingStyles?.color}
          className="font-bold text-palette-primary-dark"
          level={headingStyles?.headingLevel ?? 3}
        >
          {name ?? "name"}
        </Heading>

        <div className="w-full flex space-between gap-4">
          <MaybeRTF data={description} />

          <div className="ml-auto mr-0 flex">
            <CTA
              color={ctaStyles?.background}
              textColor={ctaStyles?.textColor}
              link={result.rawData.slug}
              label={t("learnMore", "Learn more")}
              variant={"primary"}
              className="!w-52 justify-center"
              normalizeLink={true}
            />
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <Accordion className="w-full">
        <AccordionItem key={`result-${result.index}`}>
          <AccordionTrigger className="justify-between w-full">
            <Heading
              color={headingStyles?.color}
              className="font-bold text-palette-primary-dark"
              level={headingStyles?.headingLevel ?? 3}
            >
              {name ?? "name"}
            </Heading>
          </AccordionTrigger>

          <AccordionContent className="w-full">
            <div className={`${FLEX_LAYOUT_CLASSES} space-between gap-4`}>
              <MaybeRTF data={description} />

              <div className="flex">
                <CTA
                  color={ctaStyles?.background}
                  textColor={ctaStyles?.textColor}
                  link={result.rawData.slug}
                  label={t("learnMore", "Learn more")}
                  variant={"primary"}
                  className="!w-52 justify-center"
                  normalizeLink={true}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className={`flex items-center w-full px-5 py-2.5`}>{content}</div>
  );
};
export default Cards;
