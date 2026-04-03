import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";

export type Hs1LagunaLocationHoursSectionProps = {
  locationTitle: string;
  locationCaption: string;
  hoursTitle: string;
  hoursCaption: string;
};

const Hs1LagunaLocationHoursSectionFields: Fields<Hs1LagunaLocationHoursSectionProps> =
  {
    locationTitle: { label: "Location Title", type: "text" },
    locationCaption: { label: "Location Caption", type: "text" },
    hoursTitle: { label: "Hours Title", type: "text" },
    hoursCaption: { label: "Hours Caption", type: "text" },
  };

export const Hs1LagunaLocationHoursSectionComponent: PuckComponent<
  Hs1LagunaLocationHoursSectionProps
> = (props) => {
  const hourRows = [
    { day: "Monday", time: "9:00 am - 5:00 pm" },
    { day: "Tuesday", time: "9:00 am - 5:00 pm" },
    { day: "Wednesday", time: "9:00 am - 5:00 pm" },
    { day: "Thursday", time: "9:00 am - 5:00 pm" },
    { day: "Friday", time: "9:00 am - 5:00 pm" },
    { day: "Saturday", time: "Closed" },
    { day: "Sunday", time: "Closed" },
  ];

  return (
    <section className="bg-white px-[14px] pb-[42px] pt-[30px] md:px-0 md:pb-[58px] md:pt-[40px]">
      <div className="mx-auto max-w-[1140px]">
        <div className="rounded-none bg-white px-[23px] pb-[28px] pt-[27px] shadow-[0_5px_33px_13px_rgba(0,0,0,0.08)] md:px-10 md:pb-[38px]">
          <div className="grid gap-8 md:grid-cols-2 md:gap-7">
            <div>
              <div className="pb-[11px] text-center">
                <h2 className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[23px] font-bold leading-[1.13] text-[#4f4f4f] md:text-[26px]">
                  {props.locationTitle}
                </h2>
                <h3 className="m-0 mt-0.5 font-['Roboto',Arial,Helvetica,sans-serif] text-[18px] italic font-medium leading-[1.222] text-[#8a8a8a]">
                  {props.locationCaption}
                </h3>
              </div>

              <div className="relative h-[240px] overflow-hidden bg-[#f3ede4] shadow-[0_5px_33px_13px_rgba(0,0,0,0.15)] md:h-[313px]">
                {[
                  {
                    src: "https://smbmaps.ibsrv.net/world_tiles/10/261/380.png",
                    className: "left-[66px] top-[-40px]",
                  },
                  {
                    src: "https://smbmaps.ibsrv.net/world_tiles/10/261/381.png",
                    className: "left-[66px] top-[216px]",
                  },
                  {
                    src: "https://smbmaps.ibsrv.net/world_tiles/10/260/380.png",
                    className: "left-[-190px] top-[-40px]",
                  },
                  {
                    src: "https://smbmaps.ibsrv.net/world_tiles/10/262/380.png",
                    className: "left-[322px] top-[-40px]",
                  },
                  {
                    src: "https://smbmaps.ibsrv.net/world_tiles/10/260/381.png",
                    className: "left-[-190px] top-[216px]",
                  },
                  {
                    src: "https://smbmaps.ibsrv.net/world_tiles/10/262/381.png",
                    className: "left-[322px] top-[216px]",
                  },
                ].map((tile) => (
                  <img
                    key={tile.src}
                    src={tile.src}
                    alt=""
                    className={`absolute h-64 w-64 max-w-none ${tile.className}`}
                  />
                ))}

                <div className="absolute left-1/2 top-1/2 h-[41px] w-[25px] -translate-x-1/2 -translate-y-1/2 bg-[url('https://www.ofc-laguna.com/plugins/smb/map/assets/css/images/marker-icon.png')] bg-contain bg-no-repeat" />

                <div className="absolute bottom-[22px] left-1/2 w-[220px] -translate-x-1/2 rounded-sm bg-white px-3 py-2 text-center text-[11px] leading-[1.35] text-[#4f4f4f] shadow-[0_2px_8px_rgba(0,0,0,0.18)] md:w-[298px]">
                  3010 Highland Parkway, Downers Grove, IL, 60515, US
                </div>
              </div>
            </div>

            <div>
              <div className="pb-[11px] text-center">
                <h2 className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[23px] font-bold leading-[1.13] text-[#4f4f4f] md:text-[26px]">
                  {props.hoursTitle}
                </h2>
                <h3 className="m-0 mt-0.5 font-['Roboto',Arial,Helvetica,sans-serif] text-[18px] italic font-medium leading-[1.222] text-[#8a8a8a]">
                  {props.hoursCaption}
                </h3>
              </div>

              <div className="mx-auto max-w-[486px] pt-4 md:pt-10">
                <p className="m-0 text-center font-['Roboto',Arial,Helvetica,sans-serif] text-[13px] font-bold text-[#4f4f4f] md:text-[16px]">
                  Primary Location
                </p>
                <div className="mt-3 rounded-none border border-[#f0ddd4] bg-white">
                  {hourRows.map((row) => (
                    <div
                      key={row.day}
                      className="grid grid-cols-[98px_1fr] items-center border-b border-[#f0ddd4] last:border-b-0 md:grid-cols-[134px_1fr]"
                    >
                      <div className="bg-[#6b3a2c] px-3 py-[9px] text-center font-['Roboto',Arial,Helvetica,sans-serif] text-[12px] font-bold text-white md:text-[13px]">
                        {row.day}
                      </div>
                      <div className="px-3 py-[9px] text-center font-['Roboto',Arial,Helvetica,sans-serif] text-[12px] text-[#4f4f4f] md:text-[13px]">
                        {row.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1LagunaLocationHoursSection: ComponentConfig<Hs1LagunaLocationHoursSectionProps> =
  {
    label: "Our Location & Hours",
    fields: Hs1LagunaLocationHoursSectionFields,
    defaultProps: {
      locationTitle: "Our Location",
      locationCaption: "Find us on the map",
      hoursTitle: "Hours of Operation",
      hoursCaption: "Our Regular Schedule",
    },
    render: Hs1LagunaLocationHoursSectionComponent,
  };
