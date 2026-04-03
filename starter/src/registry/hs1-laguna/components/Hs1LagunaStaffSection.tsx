import { useState } from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type StaffMember = {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  linkLabel: string;
  link: string;
};

export type Hs1LagunaStaffSectionProps = {
  title: string;
  caption: string;
  members: StaffMember[];
};

const Hs1LagunaStaffSectionFields: Fields<Hs1LagunaStaffSectionProps> = {
  title: { label: "Title", type: "text" },
  caption: { label: "Caption", type: "text" },
  members: {
    label: "Members",
    type: "array",
    arrayFields: {
      name: { label: "Name", type: "text" },
      role: { label: "Role", type: "text" },
      description: { label: "Description", type: "text" },
      imageUrl: { label: "Image Url", type: "text" },
      linkLabel: { label: "Link Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      name: "Team Member",
      role: "Role",
      description: "Bio",
      imageUrl: "",
      linkLabel: "Read More",
      link: "#",
    },
    getItemSummary: (item: StaffMember) => item.name,
  },
};

export const Hs1LagunaStaffSectionComponent: PuckComponent<
  Hs1LagunaStaffSectionProps
> = ({ title, caption, members }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMember = members[activeIndex] ?? members[0];

  if (!activeMember) {
    return <></>;
  }

  return (
    <section className="bg-white px-[14px] pb-[44px] pt-[26px] md:px-0 md:pb-[56px] md:pt-[34px]">
      <div className="mx-auto max-w-[1140px]">
        <div className="pb-[14px] text-center">
          <h2 className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[23px] font-bold leading-[1.13] text-[#4f4f4f] md:text-[26px]">
            {title}
          </h2>
          <h3 className="m-0 mt-0.5 font-['Roboto',Arial,Helvetica,sans-serif] text-[18px] italic font-medium leading-[1.222] text-[#8a8a8a]">
            {caption}
          </h3>
        </div>

        <div className="mx-auto max-w-[976px] bg-white px-[24px] pt-1 md:px-6">
          <div className="relative rounded-none bg-white px-[14px] py-[18px] shadow-[0_5px_24px_rgba(0,0,0,0.08)] md:flex md:items-start md:gap-4 md:px-[16px] md:py-[20px]">
            <div className="mx-auto mb-4 h-[84px] w-[84px] shrink-0 overflow-hidden rounded-none md:mb-0 md:h-[98px] md:w-[98px]">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${activeMember.imageUrl})` }}
              />
            </div>

            <div className="text-center md:text-left">
              <div className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[18px] font-bold leading-[1.15] text-[#4f4f4f] md:text-[20px]">
                {activeMember.name}
              </div>
              <div className="m-0 mt-1 font-['Roboto',Arial,Helvetica,sans-serif] text-[14px] italic text-[#8a8a8a] md:text-[15px]">
                {activeMember.role}
              </div>
              <p className="m-0 mt-3 text-left text-[13px] leading-[1.54] text-[#4f4f4f] md:text-[14px]">
                {activeMember.description}
              </p>

              {activeMember.link ? (
                <div className="mt-4">
                  <Link
                    cta={{ link: activeMember.link, linkType: "URL" }}
                    className="inline-flex min-w-[140px] items-center justify-center border border-[#755b53] bg-[#755b53] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#8f4638]"
                  >
                    {activeMember.linkLabel}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {members.length > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex(
                    activeIndex === 0 ? members.length - 1 : activeIndex - 1,
                  )
                }
                className="h-10 w-10 rounded-full border border-[#755b53] text-[#755b53]"
              >
                ‹
              </button>
              <div className="flex items-center gap-2">
                {members.map((member, index) => (
                  <button
                    key={`${member.name}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full ${
                      index === activeIndex ? "bg-[#755b53]" : "bg-[#d5b8ae]"
                    }`}
                    aria-label={`Show staff member ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex(
                    activeIndex === members.length - 1 ? 0 : activeIndex + 1,
                  )
                }
                className="h-10 w-10 rounded-full border border-[#755b53] text-[#755b53]"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const Hs1LagunaStaffSection: ComponentConfig<Hs1LagunaStaffSectionProps> =
  {
    label: "Meet Our Staff",
    fields: Hs1LagunaStaffSectionFields,
    defaultProps: {
      title: "Meet Our Staff",
      caption: "Learn Who We Are",
      members: [
        {
          name: "Danielle Harris",
          role: "Office Manager",
          description:
            "Danielle is a graduate of University of Illinois. She enjoys meeting new patients, and spends her spare time fostering dogs and exploring local restaurants.",
          imageUrl:
            "https://cdcssl.ibsrv.net/ibimg/smb/200x200_80/webmgr/1o/s/5/_SHARED/staff_3.jpg.webp?93137c4acfded3fb32879391b6cf9968",
          linkLabel: "",
          link: "",
        },
        {
          name: "Dr. Sarah Green",
          role: "Doctor",
          description:
            "Dr. Sarah Green's practice philosophy is based on extreme excellence. When not working with her patients she enjoys baking and watching movies.",
          imageUrl:
            "https://cdcssl.ibsrv.net/ibimg/smb/200x200_80/webmgr/1o/s/5/_SHARED/staff_2.jpg.webp?bc2462d0ef5a3284b8c8d9c9491708dd",
          linkLabel: "",
          link: "",
        },
        {
          name: "Dr. John Smith",
          role: "Doctor",
          description:
            "Dr. John Smith was born and raised in Minnesota. He received his degree from the University of Minnesota in 1990. He practiced in Minneapolis for ten years. Dr. Smith entered the Master'Degree program in at the University of Minnesota in 2000. Dr Smith enjoys spending time with his family, traveling, and exploring the wilderness of the Boundary Waters.",
          imageUrl:
            "https://cdcssl.ibsrv.net/ibimg/smb/200x200_80/webmgr/1o/s/5/_SHARED/staff_1.jpg.webp?0179ff3475d44b26f95e529c2abcf3dd",
          linkLabel: "Read More",
          link: "https://www.ofc-laguna.com/staff",
        },
      ],
    },
    render: Hs1LagunaStaffSectionComponent,
  };
