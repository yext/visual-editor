import { CardProps, DefaultRawDataType } from "@yext/search-ui-react";
import { CardTypeProp } from "./propsAndTypes.ts";

interface CardsProps extends CardProps<DefaultRawDataType> {
  cardType?: CardTypeProp;
}

const Cards = ({ result, cardType = "Standard" }: CardsProps) => {
  // const name =
  //   typeof result.rawData?.name === "string" ? result.rawData.name : "";

  return (
    <div className="flex px-5 py-2.5 items-center w-full">
      <div className="flex flex-col justify-center text-[#382e2c] gap-2">
        <h3 className="text-lg font-bold">
          {(result.rawData?.name as any) ?? "name"}
        </h3>
        <div className="w-full flex space-between">
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit
            illo tenetur aut quas, dolor repudiandae dignissimos cumque
            asperiores doloribus blanditiis molestiae omnis quo. Consequatur
            accusamus distinctio sint alias dignissimos labore! Lorem ipsum
            dolor sit amet consectetur, adipisicing elit. Impedit illo tenetur
            aut quas, dolor repudiandae dignissimos cumque asperiores doloribus
            blanditiis molestiae omnis quo. Consequatur accusamus distinctio
            sint alias dignissimos labore! Lorem ipsum dolor sit amet
            consectetur, adipisicing elit. Impedit illo tenetur aut quas, dolor
            repudiandae dignissimos cumque asperiores doloribus blanditiis
            molestiae omnis quo. Consequatur accusamus distinctio sint alias
            dignissimos labore! Lorem ipsum dolor sit amet consectetur,
            adipisicing elit. Impedit illo tenetur aut quas, dolor repudiandae
            dignissimos cumque asperiores doloribus blanditiis molestiae omnis
            quo. Consequatur accusamus distinctio sint alias dignissimos labore!
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit
            illo tenetur aut quas, dolor repudiandae dignissimos cumque
            asperiores doloribus blanditiis molestiae omnis quo. Consequatur
            accusamus distinctio sint alias dignissimos labore! Lorem ipsum
            dolor sit amet consectetur, adipisicing elit. Impedit illo tenetur
            aut quas, dolor repudiandae dignissimos cumque asperiores doloribus
            blanditiis molestiae omnis quo. Consequatur accusamus distinctio
            sint alias dignissimos labore!
          </p>
          <div className="ml-2.5 flex">
            <a className="text-sm p-2.5 w-44 mt-2.5 rounded-[10px] justify-center item-center ve-bg-red-500 hover:cursor-pointer h-fit flex text-white font-bold">
              {cardType}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cards;
