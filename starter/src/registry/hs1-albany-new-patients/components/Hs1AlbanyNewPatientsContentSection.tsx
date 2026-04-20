import { ComponentConfig, PuckComponent } from "@puckeditor/core";

export type Hs1AlbanyNewPatientsContentSectionProps = Record<string, never>;

export const Hs1AlbanyNewPatientsContentSectionComponent: PuckComponent<
  Hs1AlbanyNewPatientsContentSectionProps
> = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1170px] px-[15px] pb-[50px] pt-[25px] text-[#4a4a4a]">
        <div className="max-w-[1110px] font-['Open_Sans',Arial,sans-serif] text-[16px] leading-7">
          <h2 className="m-0 font-['Montserrat','Open_Sans',sans-serif] text-[22px] font-normal leading-7">
            Patient Forms, Map and Directions to Downers Grove Office
          </h2>
          <p className="mb-0 mt-4">
            Your first visit establishes a foundation for the relationship with
            your doctor. This section is a temporary stub that restores the
            missing starter registry component so the dev server can boot again.
          </p>
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyNewPatientsContentSection: ComponentConfig<Hs1AlbanyNewPatientsContentSectionProps> =
  {
    label: "Hs1 Albany New Patients Content Section",
    fields: {},
    defaultProps: {},
    render: Hs1AlbanyNewPatientsContentSectionComponent,
  };
