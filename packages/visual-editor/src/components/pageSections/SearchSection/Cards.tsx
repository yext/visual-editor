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
import { CardTypeProp, VerticalLayout } from "./defaultPropsAndTypes.ts";
import { Background } from "../../atoms/background.tsx";
import { backgroundColors } from "../../../utils/themeConfigOptions.ts";

interface CardsProps extends CardProps<any> {
  cardType?: CardTypeProp;
  layout?: VerticalLayout;
  isVertical?: boolean;
  index?: number;
}
const Cards = ({
  result,
  cardType = "Standard",
  layout,
  isVertical = false,
  index = 0,
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
  const unitLabel = "mi";

  if (layout === "Map") {
    const displayDistance =
      typeof result.distance === "number"
        ? `${result.distance} ${unitLabel}`
        : undefined;

    content = (
      <div className="flex flex-col w-full">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Background
              background={backgroundColors.background6.value}
              className="flex-shrink-0 w-6 h-6 rounded-full font-bold hidden md:flex items-center justify-center text-body-sm-fontSize"
            >
              {nIndex}
            </Background>
            <h3 className="text-xl font-semibold">{name}</h3>
          </div>
          {displayDistance && (
            <div className="font-light">{displayDistance} </div>
          )}
        </div>
        <div
          className={`flex justify-between ${isVertical ? `flex-col` : `flex-row`}`}
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
            className={`flex flex-col gap-2 w-full ${isVertical ? `items-start` : `items-end`}`}
          >
            <CTA
              link={result.rawData.slug}
              label={t("visitPage", "Visit Page")}
              variant={"primary"}
              className="!w-52 justify-center"
            />
            <CTA
              link={getDirections(result.rawData.address)}
              label={t("getDirections", "Get Directions")}
              variant={"primary"}
              className="!w-52 justify-center"
            />
          </div>
        </div>
      </div>
    );
  } else if (cardType === "Standard") {
    content = (
      <div className="w-full flex flex-col justify-center text-[#382e2c] gap-2">
        <h3 className="text-lg font-semibold">{name ?? "name"}</h3>

        <div className="w-full flex space-between">
          <MaybeRTF data={description} />

          <div className="ml-auto mr-0 flex">
            <a className="text-sm p-2.5 w-44 mt-2.5 rounded-[10px] justify-center items-center ve-bg-red-500 hover:cursor-pointer h-fit flex text-white font-bold">
              {cardType}
            </a>
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <Accordion className="w-full">
        <AccordionItem key={`result-${result.index}`} className="px-5 py-2.5">
          <AccordionTrigger className="justify-between w-full">
            <h3 className="text-lg font-semibold">
              {(result.rawData?.name as any) ?? "name"}
            </h3>
          </AccordionTrigger>

          <AccordionContent className="w-full">
            <div className="w-full flex flex-col space-between">
              <MaybeRTF data={description} />

              <div className="flex">
                <a className="text-sm p-2.5 w-44 mt-2.5 rounded-[10px] justify-center items-center ve-bg-red-500 hover:cursor-pointer h-fit flex text-white font-bold">
                  {cardType}
                </a>
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
