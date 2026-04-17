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
  Hs1AlbanyStaffBreadcrumbsSection,
  Hs1AlbanyStaffBreadcrumbsSectionProps,
} from "./registry/hs1-albany-staff/components/Hs1AlbanyStaffBreadcrumbsSection";
import {
  Hs1AlbanyStaffContactFormSection,
  Hs1AlbanyStaffContactFormSectionProps,
} from "./registry/hs1-albany-staff/components/Hs1AlbanyStaffContactFormSection";
import {
  Hs1AlbanyStaffCopyrightSection,
  Hs1AlbanyStaffCopyrightSectionProps,
} from "./registry/hs1-albany-staff/components/Hs1AlbanyStaffCopyrightSection";
import {
  Hs1AlbanyStaffFooterSection,
  Hs1AlbanyStaffFooterSectionProps,
} from "./registry/hs1-albany-staff/components/Hs1AlbanyStaffFooterSection";
import {
  Hs1AlbanyStaffHeaderSection,
  Hs1AlbanyStaffHeaderSectionProps,
} from "./registry/hs1-albany-staff/components/Hs1AlbanyStaffHeaderSection";
import {
  Hs1AlbanyStaffHoursSection,
  Hs1AlbanyStaffHoursSectionProps,
} from "./registry/hs1-albany-staff/components/Hs1AlbanyStaffHoursSection";
import {
  Hs1AlbanyStaffLocationSection,
  Hs1AlbanyStaffLocationSectionProps,
} from "./registry/hs1-albany-staff/components/Hs1AlbanyStaffLocationSection";
import {
  Hs1AlbanyStaffRosterSection,
  Hs1AlbanyStaffRosterSectionProps,
} from "./registry/hs1-albany-staff/components/Hs1AlbanyStaffRosterSection";
import {
  Hs1AlbanyStaffTitleSection,
  Hs1AlbanyStaffTitleSectionProps,
} from "./registry/hs1-albany-staff/components/Hs1AlbanyStaffTitleSection";
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
  Hs1AlbanyOfficeContactFormSection,
  Hs1AlbanyOfficeContactFormSectionProps,
} from "./registry/hs1-albany-office/components/Hs1AlbanyOfficeContactFormSection";
import {
  Hs1AlbanyOfficeContentSection,
  Hs1AlbanyOfficeContentSectionProps,
} from "./registry/hs1-albany-office/components/Hs1AlbanyOfficeContentSection";
import {
  Hs1AlbanyOfficeFooterSection,
  Hs1AlbanyOfficeFooterSectionProps,
} from "./registry/hs1-albany-office/components/Hs1AlbanyOfficeFooterSection";
import {
  Hs1AlbanyOfficeHeaderSection,
  Hs1AlbanyOfficeHeaderSectionProps,
} from "./registry/hs1-albany-office/components/Hs1AlbanyOfficeHeaderSection";
import {
  Hs1AlbanyOfficeHeroSection,
  Hs1AlbanyOfficeHeroSectionProps,
} from "./registry/hs1-albany-office/components/Hs1AlbanyOfficeHeroSection";
import {
  Hs1AlbanyOfficeHoursSection,
  Hs1AlbanyOfficeHoursSectionProps,
} from "./registry/hs1-albany-office/components/Hs1AlbanyOfficeHoursSection";
import {
  Hs1AlbanyOfficeLocationSection,
  Hs1AlbanyOfficeLocationSectionProps,
} from "./registry/hs1-albany-office/components/Hs1AlbanyOfficeLocationSection";
import {
  Hs1AlbanyServicesBreadcrumbsSection,
  Hs1AlbanyServicesBreadcrumbsSectionProps,
} from "./registry/hs1-albany-services/components/Hs1AlbanyServicesBreadcrumbsSection";
import {
  Hs1AlbanyServicesContactFormSection,
  Hs1AlbanyServicesContactFormSectionProps,
} from "./registry/hs1-albany-services/components/Hs1AlbanyServicesContactFormSection";
import {
  Hs1AlbanyServicesContentSection,
  Hs1AlbanyServicesContentSectionProps,
} from "./registry/hs1-albany-services/components/Hs1AlbanyServicesContentSection";
import {
  Hs1AlbanyServicesCopyrightSection,
  Hs1AlbanyServicesCopyrightSectionProps,
} from "./registry/hs1-albany-services/components/Hs1AlbanyServicesCopyrightSection";
import {
  Hs1AlbanyServicesFooterSection,
  Hs1AlbanyServicesFooterSectionProps,
} from "./registry/hs1-albany-services/components/Hs1AlbanyServicesFooterSection";
import {
  Hs1AlbanyServicesHeaderSection,
  Hs1AlbanyServicesHeaderSectionProps,
} from "./registry/hs1-albany-services/components/Hs1AlbanyServicesHeaderSection";
import {
  Hs1AlbanyServicesHoursSection,
  Hs1AlbanyServicesHoursSectionProps,
} from "./registry/hs1-albany-services/components/Hs1AlbanyServicesHoursSection";
import {
  Hs1AlbanyServicesLocationSection,
  Hs1AlbanyServicesLocationSectionProps,
} from "./registry/hs1-albany-services/components/Hs1AlbanyServicesLocationSection";
import {
  Hs1AlbanyServicesTitleSection,
  Hs1AlbanyServicesTitleSectionProps,
} from "./registry/hs1-albany-services/components/Hs1AlbanyServicesTitleSection";
import {
  Hs1AlbanyNewPatientsBreadcrumbsSection,
  Hs1AlbanyNewPatientsBreadcrumbsSectionProps,
} from "./registry/hs1-albany-new-patients/components/Hs1AlbanyNewPatientsBreadcrumbsSection";
import {
  Hs1AlbanyNewPatientsContactFormSection,
  Hs1AlbanyNewPatientsContactFormSectionProps,
} from "./registry/hs1-albany-new-patients/components/Hs1AlbanyNewPatientsContactFormSection";
import {
  Hs1AlbanyNewPatientsContentSection,
  Hs1AlbanyNewPatientsContentSectionProps,
} from "./registry/hs1-albany-new-patients/components/Hs1AlbanyNewPatientsContentSection";
import {
  Hs1AlbanyNewPatientsCopyrightSection,
  Hs1AlbanyNewPatientsCopyrightSectionProps,
} from "./registry/hs1-albany-new-patients/components/Hs1AlbanyNewPatientsCopyrightSection";
import {
  Hs1AlbanyNewPatientsFooterSection,
  Hs1AlbanyNewPatientsFooterSectionProps,
} from "./registry/hs1-albany-new-patients/components/Hs1AlbanyNewPatientsFooterSection";
import {
  Hs1AlbanyNewPatientsHeaderSection,
  Hs1AlbanyNewPatientsHeaderSectionProps,
} from "./registry/hs1-albany-new-patients/components/Hs1AlbanyNewPatientsHeaderSection";
import {
  Hs1AlbanyNewPatientsHoursSection,
  Hs1AlbanyNewPatientsHoursSectionProps,
} from "./registry/hs1-albany-new-patients/components/Hs1AlbanyNewPatientsHoursSection";
import {
  Hs1AlbanyNewPatientsLocationSection,
  Hs1AlbanyNewPatientsLocationSectionProps,
} from "./registry/hs1-albany-new-patients/components/Hs1AlbanyNewPatientsLocationSection";
import {
  Hs1AlbanyNewPatientsTitleSection,
  Hs1AlbanyNewPatientsTitleSectionProps,
} from "./registry/hs1-albany-new-patients/components/Hs1AlbanyNewPatientsTitleSection";
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
  Hs1AlbanyStaffHeaderSection: Hs1AlbanyStaffHeaderSectionProps;
  Hs1AlbanyStaffBreadcrumbsSection: Hs1AlbanyStaffBreadcrumbsSectionProps;
  Hs1AlbanyStaffTitleSection: Hs1AlbanyStaffTitleSectionProps;
  Hs1AlbanyStaffRosterSection: Hs1AlbanyStaffRosterSectionProps;
  Hs1AlbanyStaffHoursSection: Hs1AlbanyStaffHoursSectionProps;
  Hs1AlbanyStaffLocationSection: Hs1AlbanyStaffLocationSectionProps;
  Hs1AlbanyStaffContactFormSection: Hs1AlbanyStaffContactFormSectionProps;
  Hs1AlbanyStaffFooterSection: Hs1AlbanyStaffFooterSectionProps;
  Hs1AlbanyStaffCopyrightSection: Hs1AlbanyStaffCopyrightSectionProps;
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
  Hs1AlbanyOfficeHeaderSection: Hs1AlbanyOfficeHeaderSectionProps;
  Hs1AlbanyOfficeHeroSection: Hs1AlbanyOfficeHeroSectionProps;
  Hs1AlbanyOfficeContentSection: Hs1AlbanyOfficeContentSectionProps;
  Hs1AlbanyOfficeHoursSection: Hs1AlbanyOfficeHoursSectionProps;
  Hs1AlbanyOfficeLocationSection: Hs1AlbanyOfficeLocationSectionProps;
  Hs1AlbanyOfficeContactFormSection: Hs1AlbanyOfficeContactFormSectionProps;
  Hs1AlbanyOfficeFooterSection: Hs1AlbanyOfficeFooterSectionProps;
  Hs1AlbanyServicesHeaderSection: Hs1AlbanyServicesHeaderSectionProps;
  Hs1AlbanyServicesBreadcrumbsSection: Hs1AlbanyServicesBreadcrumbsSectionProps;
  Hs1AlbanyServicesTitleSection: Hs1AlbanyServicesTitleSectionProps;
  Hs1AlbanyServicesContentSection: Hs1AlbanyServicesContentSectionProps;
  Hs1AlbanyServicesHoursSection: Hs1AlbanyServicesHoursSectionProps;
  Hs1AlbanyServicesLocationSection: Hs1AlbanyServicesLocationSectionProps;
  Hs1AlbanyServicesContactFormSection: Hs1AlbanyServicesContactFormSectionProps;
  Hs1AlbanyServicesFooterSection: Hs1AlbanyServicesFooterSectionProps;
  Hs1AlbanyServicesCopyrightSection: Hs1AlbanyServicesCopyrightSectionProps;
  Hs1AlbanyNewPatientsHeaderSection: Hs1AlbanyNewPatientsHeaderSectionProps;
  Hs1AlbanyNewPatientsBreadcrumbsSection: Hs1AlbanyNewPatientsBreadcrumbsSectionProps;
  Hs1AlbanyNewPatientsTitleSection: Hs1AlbanyNewPatientsTitleSectionProps;
  Hs1AlbanyNewPatientsContentSection: Hs1AlbanyNewPatientsContentSectionProps;
  Hs1AlbanyNewPatientsHoursSection: Hs1AlbanyNewPatientsHoursSectionProps;
  Hs1AlbanyNewPatientsLocationSection: Hs1AlbanyNewPatientsLocationSectionProps;
  Hs1AlbanyNewPatientsContactFormSection: Hs1AlbanyNewPatientsContactFormSectionProps;
  Hs1AlbanyNewPatientsFooterSection: Hs1AlbanyNewPatientsFooterSectionProps;
  Hs1AlbanyNewPatientsCopyrightSection: Hs1AlbanyNewPatientsCopyrightSectionProps;
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
  Hs1AlbanyStaffHeaderSection,
  Hs1AlbanyStaffBreadcrumbsSection,
  Hs1AlbanyStaffTitleSection,
  Hs1AlbanyStaffRosterSection,
  Hs1AlbanyStaffHoursSection,
  Hs1AlbanyStaffLocationSection,
  Hs1AlbanyStaffContactFormSection,
  Hs1AlbanyStaffFooterSection,
  Hs1AlbanyStaffCopyrightSection,
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
  Hs1AlbanyOfficeHeaderSection,
  Hs1AlbanyOfficeHeroSection,
  Hs1AlbanyOfficeContentSection,
  Hs1AlbanyOfficeHoursSection,
  Hs1AlbanyOfficeLocationSection,
  Hs1AlbanyOfficeContactFormSection,
  Hs1AlbanyOfficeFooterSection,
  Hs1AlbanyServicesHeaderSection,
  Hs1AlbanyServicesBreadcrumbsSection,
  Hs1AlbanyServicesTitleSection,
  Hs1AlbanyServicesContentSection,
  Hs1AlbanyServicesHoursSection,
  Hs1AlbanyServicesLocationSection,
  Hs1AlbanyServicesContactFormSection,
  Hs1AlbanyServicesFooterSection,
  Hs1AlbanyServicesCopyrightSection,
  Hs1AlbanyNewPatientsHeaderSection,
  Hs1AlbanyNewPatientsBreadcrumbsSection,
  Hs1AlbanyNewPatientsTitleSection,
  Hs1AlbanyNewPatientsContentSection,
  Hs1AlbanyNewPatientsHoursSection,
  Hs1AlbanyNewPatientsLocationSection,
  Hs1AlbanyNewPatientsContactFormSection,
  Hs1AlbanyNewPatientsFooterSection,
  Hs1AlbanyNewPatientsCopyrightSection,
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
    hs1AlbanyStaff: {
      title: "HS1 Albany Staff",
      components: [
        "Hs1AlbanyStaffHeaderSection",
        "Hs1AlbanyStaffBreadcrumbsSection",
        "Hs1AlbanyStaffTitleSection",
        "Hs1AlbanyStaffRosterSection",
        "Hs1AlbanyStaffHoursSection",
        "Hs1AlbanyStaffLocationSection",
        "Hs1AlbanyStaffContactFormSection",
        "Hs1AlbanyStaffFooterSection",
        "Hs1AlbanyStaffCopyrightSection",
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
    hs1AlbanyOffice: {
      title: "HS1 Albany Office",
      components: [
        "Hs1AlbanyOfficeHeaderSection",
        "Hs1AlbanyOfficeHeroSection",
        "Hs1AlbanyOfficeContentSection",
        "Hs1AlbanyOfficeHoursSection",
        "Hs1AlbanyOfficeLocationSection",
        "Hs1AlbanyOfficeContactFormSection",
        "Hs1AlbanyOfficeFooterSection",
      ],
    },
    hs1AlbanyServices: {
      title: "HS1 Albany Services",
      components: [
        "Hs1AlbanyServicesHeaderSection",
        "Hs1AlbanyServicesBreadcrumbsSection",
        "Hs1AlbanyServicesTitleSection",
        "Hs1AlbanyServicesContentSection",
        "Hs1AlbanyServicesHoursSection",
        "Hs1AlbanyServicesLocationSection",
        "Hs1AlbanyServicesContactFormSection",
        "Hs1AlbanyServicesFooterSection",
        "Hs1AlbanyServicesCopyrightSection",
      ],
    },
    hs1AlbanyNewPatients: {
      title: "HS1 Albany New Patients",
      components: [
        "Hs1AlbanyNewPatientsHeaderSection",
        "Hs1AlbanyNewPatientsBreadcrumbsSection",
        "Hs1AlbanyNewPatientsTitleSection",
        "Hs1AlbanyNewPatientsContentSection",
        "Hs1AlbanyNewPatientsHoursSection",
        "Hs1AlbanyNewPatientsLocationSection",
        "Hs1AlbanyNewPatientsContactFormSection",
        "Hs1AlbanyNewPatientsFooterSection",
        "Hs1AlbanyNewPatientsCopyrightSection",
      ],
    },
  },
  root: mainConfig.root,
};

export const componentRegistry: Record<string, Config<DevProps>> = {
  dev: devConfig,
};
