import { BasicSelectorFieldOverride } from "./BasicSelectorField.tsx";
import { CodeFieldOverride } from "./CodeField.tsx";
import { DateTimeSelectorFieldOverride } from "./DateTimeSelectorField.tsx";
import { EntityFieldSelectorFieldOverride } from "./EntityFieldSelectorField.tsx";
import { FontSizeSelectorFieldOverride } from "./FontSizeSelectorField.tsx";
import { CTASelectorFieldOverride } from "./CTASelectorField.tsx";
import { MultiSelectorFieldOverride } from "./MultiSelectorField.tsx";
import { OptionalNumberFieldOverride } from "./OptionalNumberField.tsx";
import { ImageFieldOverride } from "./ImageField.tsx";
import { StyledButtonFieldOverride } from "./styledFields/StyledButtonField.tsx";
import { StyledImageFieldOverride } from "./styledFields/StyledImageField.tsx";
import { StyledLinkFieldOverride } from "./styledFields/StyledLinkField.tsx";
import { StyledPageSectionFieldOverride } from "./styledFields/StyledPageSection.tsx";
import { StyledTextFieldOverride } from "./styledFields/StyledTextField.tsx";
import { TranslatableStringFieldOverride } from "./TranslatableStringField.tsx";
import { VideoFieldOverride } from "./VideoField.tsx";

export const YextPuckFieldOverrides = {
  basicSelector: BasicSelectorFieldOverride,
  ctaSelector: CTASelectorFieldOverride,
  code: CodeFieldOverride,
  dateTimeSelector: DateTimeSelectorFieldOverride,
  entityField: EntityFieldSelectorFieldOverride,
  multiSelector: MultiSelectorFieldOverride,
  fontSizeSelector: FontSizeSelectorFieldOverride,
  image: ImageFieldOverride,
  optionalNumber: OptionalNumberFieldOverride,
  styledButton: StyledButtonFieldOverride,
  styledImage: StyledImageFieldOverride,
  styledLink: StyledLinkFieldOverride,
  styledPageSection: StyledPageSectionFieldOverride,
  styledText: StyledTextFieldOverride,
  translatableString: TranslatableStringFieldOverride,
  video: VideoFieldOverride,
};

export type YextOverrideType = keyof typeof YextPuckFieldOverrides;

export const isYextOverrideType = (type: string): type is YextOverrideType =>
  type in YextPuckFieldOverrides;
