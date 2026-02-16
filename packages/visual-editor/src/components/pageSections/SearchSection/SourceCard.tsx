import { CitationProps } from "@yext/search-ui-react";

interface RawData {
  landingPageUrl?: string;
  c_primaryCTA?: {
    link?: string;
  };
}

const SourceCard = (props: CitationProps) => {
  let rawData: RawData = props.searchResult.rawData;
  let link = rawData?.landingPageUrl || rawData?.c_primaryCTA?.link || "";
  const name = props.searchResult?.name;

  return (
    <div className="your css heree">
      {link ? (
        <a href={link} className="hover:text-indigo-500">
          {name}
        </a>
      ) : (
        <p>
          {name} <span className="text-xs">(no link available)</span>
        </p>
      )}
    </div>
  );
};

export default SourceCard;
