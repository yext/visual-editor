import { ComponentConfig, PuckComponent } from "@puckeditor/core";

export type Hs1AlbanyNewPatientsContactFormSectionProps = Record<string, never>;

export const Hs1AlbanyNewPatientsContactFormSectionComponent: PuckComponent<
  Hs1AlbanyNewPatientsContactFormSectionProps
> = () => {
  return <section className="bg-[#d3a335]" />;
};

export const Hs1AlbanyNewPatientsContactFormSection: ComponentConfig<Hs1AlbanyNewPatientsContactFormSectionProps> =
  {
    label: "Hs1 Albany New Patients Contact Form Section",
    fields: {},
    defaultProps: {},
    render: Hs1AlbanyNewPatientsContactFormSectionComponent,
  };
