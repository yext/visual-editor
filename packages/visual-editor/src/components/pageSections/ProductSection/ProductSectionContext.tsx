import React, { createContext, useContext } from "react";
import { BackgroundStyle } from "@yext/visual-editor";

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
  cardBackgroundColor?: BackgroundStyle; // To pass section's card bg choice if needed? No, user didn't ask for that specifically, but hinted "styling for every card".
  // Actually, ProductCard has a backgroundColor prop. ProductSection has a backgroundColor prop (for the section).
  // The Prompt: "Changing the prop will change the styling for every card in the section."
  // This refers to the VARIANT.
  // But maybe the user assumes colors too?
  // "The styling" implies the layout/variant.
  // I will just pass the variant/visibility flags for now.
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
