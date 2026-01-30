import React, { createContext, useContext } from "react";
import { BackgroundStyle } from "../../../utils/themeConfigOptions";

export type ProductSectionVariant = "immersive" | "classic" | "minimal";
export type ProductSectionImageConstrain = "fill" | "fixed";

export interface ProductSectionContextType {
  variant?: ProductSectionVariant;
  imageConstrain?: ProductSectionImageConstrain;
  showImage?: boolean;
  showBrow?: boolean;
  showTitle?: boolean;
  showPrice?: boolean;
  showDescription?: boolean;
  showCTA?: boolean;
  cardBackgroundColor?: BackgroundStyle;
}

const ProductSectionContext = createContext<ProductSectionContextType>({});

export const ProductSectionProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ProductSectionContextType;
}) => {
  return (
    <ProductSectionContext.Provider value={value}>
      {children}
    </ProductSectionContext.Provider>
  );
};

export const useProductSectionContext = () => {
  return useContext(ProductSectionContext);
};
