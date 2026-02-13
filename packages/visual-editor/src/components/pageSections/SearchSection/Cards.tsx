import { CardProps } from "@yext/search-ui-react";
import { MaybeRTF } from "@yext/visual-editor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../atoms/accordion.tsx";
import { CardTypeProp } from "./propsAndTypes.ts";

interface CardsProps extends CardProps<any> {
  cardType?: CardTypeProp;
}

const Cards = ({ result, cardType = "Standard" }: CardsProps) => {
  const name = result.rawData.question || result.rawData.name;
  const description =
    result.rawData.answerV2 ||
    result.rawData.richTextDescriptionV2 ||
    result.rawData.bodyV2 ||
    result.rawData.description;
  return (
    <div
      className={`flex items-center w-full ${cardType === "Standard" && `px-5 py-2.5`}`}
    >
      {cardType === "Standard" ? (
        <div className="flex flex-col justify-center text-[#382e2c] gap-2">
          <h3 className="text-lg font-semibold">{name ?? "name"}</h3>
          <div className="w-full flex space-between">
            <MaybeRTF data={description} />
            <div className="ml-2.5 flex">
              <a className="text-sm p-2.5 w-44 mt-2.5 rounded-[10px] justify-center item-center ve-bg-red-500 hover:cursor-pointer h-fit flex text-white font-bold">
                {cardType}
              </a>
            </div>
          </div>
        </div>
      ) : (
        <Accordion className="w-full">
          <AccordionItem
            key={`result-${result.index}-hours`}
            className="px-5 py-2.5 "
          >
            <AccordionTrigger className="justify-between w-full">
              <h3 className="text-lg font-semibold">
                {(result.rawData?.name as any) ?? "name"}
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="w-full flex flex-col space-between">
                <MaybeRTF data={description} />
                <div className="flex">
                  <a className="text-sm p-2.5 w-44 mt-2.5 rounded-[10px] justify-center item-center ve-bg-red-500 hover:cursor-pointer h-fit flex text-white font-bold">
                    {cardType}
                  </a>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default Cards;

// const isJsonRT = (data: any) => {
//   <LexicalRichText serializedAST={JSON.stringify(data)} />;
// };
