import { type Config } from "@puckeditor/core";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
  MainConfigProps,
  mainConfig,
} from "@yext/visual-editor";
import {
  Hs1AlbanyContactFormSection,
  Hs1AlbanyContactFormSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyContactFormSection";
import {
  Hs1AlbanyCopyrightSection,
  Hs1AlbanyCopyrightSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyCopyrightSection";
import {
  Hs1AlbanyFooterSection,
  Hs1AlbanyFooterSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyFooterSection";
import {
  Hs1AlbanyHeaderSection,
  Hs1AlbanyHeaderSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyHeaderSection";
import {
  Hs1AlbanyHeroSection,
  Hs1AlbanyHeroSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyHeroSection";
import {
  Hs1AlbanyHoursSection,
  Hs1AlbanyHoursSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyHoursSection";
import {
  Hs1AlbanyLocationSection,
  Hs1AlbanyLocationSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyLocationSection";
import {
  Hs1AlbanyServicesSection,
  Hs1AlbanyServicesSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyServicesSection";
import {
  Hs1AlbanySignupFormSection,
  Hs1AlbanySignupFormSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanySignupFormSection";
import {
  Hs1AlbanyTestimonialsSection,
  Hs1AlbanyTestimonialsSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyTestimonialsSection";
import {
  Hs1AlbanyWelcomeSection,
  Hs1AlbanyWelcomeSectionProps,
} from "./registry/hs1-albany/components/Hs1AlbanyWelcomeSection";

interface DevProps extends MainConfigProps, DirectoryCategoryProps {
  Hs1AlbanyHeaderSection: Hs1AlbanyHeaderSectionProps;
  Hs1AlbanyHeroSection: Hs1AlbanyHeroSectionProps;
  Hs1AlbanyServicesSection: Hs1AlbanyServicesSectionProps;
  Hs1AlbanyWelcomeSection: Hs1AlbanyWelcomeSectionProps;
  Hs1AlbanySignupFormSection: Hs1AlbanySignupFormSectionProps;
  Hs1AlbanyTestimonialsSection: Hs1AlbanyTestimonialsSectionProps;
  Hs1AlbanyHoursSection: Hs1AlbanyHoursSectionProps;
  Hs1AlbanyLocationSection: Hs1AlbanyLocationSectionProps;
  Hs1AlbanyContactFormSection: Hs1AlbanyContactFormSectionProps;
  Hs1AlbanyFooterSection: Hs1AlbanyFooterSectionProps;
  Hs1AlbanyCopyrightSection: Hs1AlbanyCopyrightSectionProps;
}

const components: Config<DevProps>["components"] = {
  ...mainConfig.components,
  ...DirectoryCategoryComponents,
  Hs1AlbanyHeaderSection,
  Hs1AlbanyHeroSection,
  Hs1AlbanyServicesSection,
  Hs1AlbanyWelcomeSection,
  Hs1AlbanySignupFormSection,
  Hs1AlbanyTestimonialsSection,
  Hs1AlbanyHoursSection,
  Hs1AlbanyLocationSection,
  Hs1AlbanyContactFormSection,
  Hs1AlbanyFooterSection,
  Hs1AlbanyCopyrightSection,
};

export const devConfig: Config<DevProps> = {
  components,
  categories: {
    ...mainConfig.categories,
    directory: {
      title: "Directory",
      components: DirectoryCategory,
    },
    hs1Albany: {
      title: "HS1 Albany",
      components: [
        "Hs1AlbanyHeaderSection",
        "Hs1AlbanyHeroSection",
        "Hs1AlbanyServicesSection",
        "Hs1AlbanyWelcomeSection",
        "Hs1AlbanySignupFormSection",
        "Hs1AlbanyTestimonialsSection",
        "Hs1AlbanyHoursSection",
        "Hs1AlbanyLocationSection",
        "Hs1AlbanyContactFormSection",
        "Hs1AlbanyFooterSection",
        "Hs1AlbanyCopyrightSection",
      ],
    },
  },
  root: mainConfig.root,
};

export const componentRegistry: Record<string, Config<DevProps>> = {
  dev: devConfig,
};
