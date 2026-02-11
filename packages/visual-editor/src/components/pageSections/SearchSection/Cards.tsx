import { CardProps, DefaultRawDataType } from "@yext/search-ui-react";
import { CardTypeProp } from "./propsAndTypes.ts";

interface CardsProps extends CardProps<DefaultRawDataType> {
  cardType?: CardTypeProp;
}

const Cards = ({ result, cardType = "Standard" }: CardsProps) => {
  const name =
    typeof result.rawData?.name === "string" ? result.rawData.name : "";

  return (
    <div>
      {cardType} — {name}
    </div>
  );
};

export default Cards;
