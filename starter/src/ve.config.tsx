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
import {
  Hs1CarmelContactFormSection,
  Hs1CarmelContactFormSectionProps,
} from "./registry/hs1-carmel/components/Hs1CarmelContactFormSection";
import {
  Hs1CarmelCopyrightSection,
  Hs1CarmelCopyrightSectionProps,
} from "./registry/hs1-carmel/components/Hs1CarmelCopyrightSection";
import {
  Hs1CarmelFooterSection,
  Hs1CarmelFooterSectionProps,
} from "./registry/hs1-carmel/components/Hs1CarmelFooterSection";
import {
  Hs1CarmelHeaderSection,
  Hs1CarmelHeaderSectionProps,
} from "./registry/hs1-carmel/components/Hs1CarmelHeaderSection";
import {
  Hs1CarmelHeroSection,
  Hs1CarmelHeroSectionProps,
} from "./registry/hs1-carmel/components/Hs1CarmelHeroSection";
import {
  Hs1CarmelLocationSection,
  Hs1CarmelLocationSectionProps,
} from "./registry/hs1-carmel/components/Hs1CarmelLocationSection";
import {
  Hs1CarmelQuickLinksSection,
  Hs1CarmelQuickLinksSectionProps,
} from "./registry/hs1-carmel/components/Hs1CarmelQuickLinksSection";
import {
  Hs1CarmelServicesSection,
  Hs1CarmelServicesSectionProps,
} from "./registry/hs1-carmel/components/Hs1CarmelServicesSection";
import {
  Hs1CarmelWelcomeSection,
  Hs1CarmelWelcomeSectionProps,
} from "./registry/hs1-carmel/components/Hs1CarmelWelcomeSection";
import {
  Hs1ChicagoContactFormSection,
  Hs1ChicagoContactFormSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoContactFormSection";
import {
  Hs1ChicagoCopyrightSection,
  Hs1ChicagoCopyrightSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoCopyrightSection";
import {
  Hs1ChicagoFeaturedServicesSection,
  Hs1ChicagoFeaturedServicesSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoFeaturedServicesSection";
import {
  Hs1ChicagoHeaderSection,
  Hs1ChicagoHeaderSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoHeaderSection";
import {
  Hs1ChicagoHeroSection,
  Hs1ChicagoHeroSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoHeroSection";
import {
  Hs1ChicagoInsuranceSection,
  Hs1ChicagoInsuranceSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoInsuranceSection";
import {
  Hs1ChicagoLocationHoursSection,
  Hs1ChicagoLocationHoursSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoLocationHoursSection";
import {
  Hs1ChicagoOfferSection,
  Hs1ChicagoOfferSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoOfferSection";
import {
  Hs1ChicagoStaffSection,
  Hs1ChicagoStaffSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoStaffSection";
import {
  Hs1ChicagoTestimonialsSection,
  Hs1ChicagoTestimonialsSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoTestimonialsSection";
import {
  Hs1ChicagoWelcomeSection,
  Hs1ChicagoWelcomeSectionProps,
} from "./registry/hs1-chicago/components/Hs1ChicagoWelcomeSection";
import {
  Hs1LagunaCopyrightSection,
  Hs1LagunaCopyrightSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaCopyrightSection";
import {
  Hs1LagunaFeaturedArticlesSection,
  Hs1LagunaFeaturedArticlesSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaFeaturedArticlesSection";
import {
  Hs1LagunaFeaturedBlocksSection,
  Hs1LagunaFeaturedBlocksSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaFeaturedBlocksSection";
import {
  Hs1LagunaFooterSection,
  Hs1LagunaFooterSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaFooterSection";
import {
  Hs1LagunaHeaderSection,
  Hs1LagunaHeaderSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaHeaderSection";
import {
  Hs1LagunaHeroSection,
  Hs1LagunaHeroSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaHeroSection";
import {
  Hs1LagunaLocationHoursSection,
  Hs1LagunaLocationHoursSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaLocationHoursSection";
import {
  Hs1LagunaNewsletterSection,
  Hs1LagunaNewsletterSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaNewsletterSection";
import {
  Hs1LagunaOfferFormSection,
  Hs1LagunaOfferFormSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaOfferFormSection";
import {
  Hs1LagunaStaffSection,
  Hs1LagunaStaffSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaStaffSection";
import {
  Hs1LagunaTestimonialsSection,
  Hs1LagunaTestimonialsSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaTestimonialsSection";
import {
  Hs1LagunaWelcomeSection,
  Hs1LagunaWelcomeSectionProps,
} from "./registry/hs1-laguna/components/Hs1LagunaWelcomeSection";

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
  Hs1CarmelHeaderSection: Hs1CarmelHeaderSectionProps;
  Hs1CarmelHeroSection: Hs1CarmelHeroSectionProps;
  Hs1CarmelQuickLinksSection: Hs1CarmelQuickLinksSectionProps;
  Hs1CarmelWelcomeSection: Hs1CarmelWelcomeSectionProps;
  Hs1CarmelServicesSection: Hs1CarmelServicesSectionProps;
  Hs1CarmelContactFormSection: Hs1CarmelContactFormSectionProps;
  Hs1CarmelLocationSection: Hs1CarmelLocationSectionProps;
  Hs1CarmelFooterSection: Hs1CarmelFooterSectionProps;
  Hs1CarmelCopyrightSection: Hs1CarmelCopyrightSectionProps;
  Hs1ChicagoHeaderSection: Hs1ChicagoHeaderSectionProps;
  Hs1ChicagoHeroSection: Hs1ChicagoHeroSectionProps;
  Hs1ChicagoWelcomeSection: Hs1ChicagoWelcomeSectionProps;
  Hs1ChicagoOfferSection: Hs1ChicagoOfferSectionProps;
  Hs1ChicagoFeaturedServicesSection: Hs1ChicagoFeaturedServicesSectionProps;
  Hs1ChicagoStaffSection: Hs1ChicagoStaffSectionProps;
  Hs1ChicagoTestimonialsSection: Hs1ChicagoTestimonialsSectionProps;
  Hs1ChicagoContactFormSection: Hs1ChicagoContactFormSectionProps;
  Hs1ChicagoLocationHoursSection: Hs1ChicagoLocationHoursSectionProps;
  Hs1ChicagoInsuranceSection: Hs1ChicagoInsuranceSectionProps;
  Hs1ChicagoCopyrightSection: Hs1ChicagoCopyrightSectionProps;
  Hs1LagunaHeaderSection: Hs1LagunaHeaderSectionProps;
  Hs1LagunaFeaturedBlocksSection: Hs1LagunaFeaturedBlocksSectionProps;
  Hs1LagunaOfferFormSection: Hs1LagunaOfferFormSectionProps;
  Hs1LagunaWelcomeSection: Hs1LagunaWelcomeSectionProps;
  Hs1LagunaHeroSection: Hs1LagunaHeroSectionProps;
  Hs1LagunaStaffSection: Hs1LagunaStaffSectionProps;
  Hs1LagunaLocationHoursSection: Hs1LagunaLocationHoursSectionProps;
  Hs1LagunaFeaturedArticlesSection: Hs1LagunaFeaturedArticlesSectionProps;
  Hs1LagunaNewsletterSection: Hs1LagunaNewsletterSectionProps;
  Hs1LagunaTestimonialsSection: Hs1LagunaTestimonialsSectionProps;
  Hs1LagunaFooterSection: Hs1LagunaFooterSectionProps;
  Hs1LagunaCopyrightSection: Hs1LagunaCopyrightSectionProps;
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
  Hs1CarmelHeaderSection,
  Hs1CarmelHeroSection,
  Hs1CarmelQuickLinksSection,
  Hs1CarmelWelcomeSection,
  Hs1CarmelServicesSection,
  Hs1CarmelContactFormSection,
  Hs1CarmelLocationSection,
  Hs1CarmelFooterSection,
  Hs1CarmelCopyrightSection,
  Hs1ChicagoHeaderSection,
  Hs1ChicagoHeroSection,
  Hs1ChicagoWelcomeSection,
  Hs1ChicagoOfferSection,
  Hs1ChicagoFeaturedServicesSection,
  Hs1ChicagoStaffSection,
  Hs1ChicagoTestimonialsSection,
  Hs1ChicagoContactFormSection,
  Hs1ChicagoLocationHoursSection,
  Hs1ChicagoInsuranceSection,
  Hs1ChicagoCopyrightSection,
  Hs1LagunaHeaderSection,
  Hs1LagunaFeaturedBlocksSection,
  Hs1LagunaOfferFormSection,
  Hs1LagunaWelcomeSection,
  Hs1LagunaHeroSection,
  Hs1LagunaStaffSection,
  Hs1LagunaLocationHoursSection,
  Hs1LagunaFeaturedArticlesSection,
  Hs1LagunaNewsletterSection,
  Hs1LagunaTestimonialsSection,
  Hs1LagunaFooterSection,
  Hs1LagunaCopyrightSection,
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
    hs1Carmel: {
      title: "HS1 Carmel",
      components: [
        "Hs1CarmelHeaderSection",
        "Hs1CarmelHeroSection",
        "Hs1CarmelQuickLinksSection",
        "Hs1CarmelWelcomeSection",
        "Hs1CarmelServicesSection",
        "Hs1CarmelContactFormSection",
        "Hs1CarmelLocationSection",
        "Hs1CarmelFooterSection",
        "Hs1CarmelCopyrightSection",
      ],
    },
    hs1Chicago: {
      title: "HS1 Chicago",
      components: [
        "Hs1ChicagoHeaderSection",
        "Hs1ChicagoHeroSection",
        "Hs1ChicagoWelcomeSection",
        "Hs1ChicagoOfferSection",
        "Hs1ChicagoFeaturedServicesSection",
        "Hs1ChicagoStaffSection",
        "Hs1ChicagoTestimonialsSection",
        "Hs1ChicagoContactFormSection",
        "Hs1ChicagoLocationHoursSection",
        "Hs1ChicagoInsuranceSection",
        "Hs1ChicagoCopyrightSection",
      ],
    },
    hs1Laguna: {
      title: "HS1 Laguna",
      components: [
        "Hs1LagunaHeaderSection",
        "Hs1LagunaFeaturedBlocksSection",
        "Hs1LagunaOfferFormSection",
        "Hs1LagunaWelcomeSection",
        "Hs1LagunaHeroSection",
        "Hs1LagunaStaffSection",
        "Hs1LagunaLocationHoursSection",
        "Hs1LagunaFeaturedArticlesSection",
        "Hs1LagunaNewsletterSection",
        "Hs1LagunaTestimonialsSection",
        "Hs1LagunaFooterSection",
        "Hs1LagunaCopyrightSection",
      ],
    },
  },
  root: mainConfig.root,
};

export const componentRegistry: Record<string, Config<DevProps>> = {
  dev: devConfig,
};
