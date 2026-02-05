import { SectionProps, DefaultRawDataType } from "@yext/search-ui-react";

// Define Props
interface LayoutProps {
  layoutType?: "Grid" | "Flex";
  data: SectionProps<DefaultRawDataType>;
}

export const SearchLayout = ({
  layoutType = "Grid",
  data: { results, header, CardComponent },
}: LayoutProps) => {
  console.log(header);

  if (!CardComponent) {
    return <div>Missing Card Component</div>;
  }
  const classNames =
    layoutType === "Grid" ? "grid grid-cols-3 gap-4 w-full" : "flex w-full";
  return (
    <div className={classNames}>
      {results.map((r: any, index: number) => (
        <CardComponent key={index} result={r} />
      ))}
    </div>
  );
};
