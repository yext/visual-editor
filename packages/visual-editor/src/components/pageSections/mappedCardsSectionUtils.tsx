import * as React from "react";
import { SlotComponent } from "@puckeditor/core";
import { ThemeColor } from "../../utils/themeConfigOptions.ts";
import { PageSection } from "../atoms/pageSection.tsx";
import {
  isMappedCardWrapperEmpty,
  isMappedCardWrapperSelected,
} from "./entityFieldSectionUtils.ts";
import { useMappedEntitySectionEmptyState } from "./useMappedEntitySectionEmptyState.ts";

type CardWrapperSlot = Parameters<typeof isMappedCardWrapperSelected>[0];

export type MappedCardsSectionConditionalRender = {
  watchForMappedContentEmptyState: boolean;
  initialMappedContentEmpty?: boolean;
};

export const getMappedCardsSectionConditionalRender = (
  cardsWrapperSlot: CardWrapperSlot
): MappedCardsSectionConditionalRender => ({
  watchForMappedContentEmptyState:
    isMappedCardWrapperSelected(cardsWrapperSlot),
  initialMappedContentEmpty: isMappedCardWrapperEmpty(cardsWrapperSlot),
});

export const MappedCardsSectionContent = ({
  backgroundColor,
  showSectionHeading,
  SectionHeadingSlot,
  CardsWrapperSlot,
  setCardsWrapperRef,
}: {
  backgroundColor?: ThemeColor;
  showSectionHeading: boolean;
  SectionHeadingSlot: SlotComponent;
  CardsWrapperSlot: SlotComponent;
  setCardsWrapperRef?: (element: HTMLDivElement | null) => void;
}) => {
  return (
    <PageSection background={backgroundColor} className="flex flex-col gap-8">
      {showSectionHeading && (
        <SectionHeadingSlot style={{ height: "auto" }} allow={[]} />
      )}
      <div ref={setCardsWrapperRef}>
        <CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
      </div>
    </PageSection>
  );
};

export const MappedCardsSectionShell = ({
  conditionalRender,
  isEditing,
  CardsWrapperSlot,
  children,
}: {
  conditionalRender?: MappedCardsSectionConditionalRender;
  isEditing: boolean;
  CardsWrapperSlot: SlotComponent;
  children: (
    setCardsWrapperRef: (element: HTMLDivElement | null) => void
  ) => React.ReactNode;
}) => {
  const watchForMappedContentEmptyState =
    conditionalRender?.watchForMappedContentEmptyState ?? false;
  const initialMappedContentEmpty =
    conditionalRender?.initialMappedContentEmpty ?? false;
  const { setWrapperRef, isMappedContentEmpty } =
    useMappedEntitySectionEmptyState({
      enabled: watchForMappedContentEmptyState,
      initialIsMappedContentEmpty: initialMappedContentEmpty,
    });

  if (watchForMappedContentEmptyState && isMappedContentEmpty && !isEditing) {
    return (
      <div ref={setWrapperRef} className="hidden" aria-hidden="true">
        <CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
      </div>
    );
  }

  return children(setWrapperRef);
};
