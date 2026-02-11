import { CardProps, DefaultRawDataType } from "@yext/search-ui-react";
import { CardTypeProp } from "./propsAndTypes.ts";
import { Heading } from "../../atoms/heading.tsx";
import { Body } from "../../atoms/body.tsx";

interface CardsProps extends CardProps<DefaultRawDataType> {
  cardType?: CardTypeProp;
}

const Cards = ({ result, cardType = "Standard" }: CardsProps) => {
  // const name =
  //   typeof result.rawData?.name === "string" ? result.rawData.name : "";

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border bg-white h-full">
      <div className="grow"></div>
      <div className="p-8">
        <div className="flex flex-col gap-1">
          <Heading level={3}>{(result.rawData?.name as any) ?? "name"}</Heading>
          <Body>{cardType}</Body>
        </div>
      </div>
    </div>
  );
};

export default Cards;
