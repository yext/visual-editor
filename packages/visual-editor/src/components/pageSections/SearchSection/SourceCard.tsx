import { CitationProps } from "@yext/search-ui-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <div className="border px-5 py-2.5 rounded-md">
      {link ? (
        <a href={link}>{name}</a>
      ) : (
        <p>
          {name}{" "}
          <span className="text-xs">
            ({t("noLinkAvailable", "no link available")})
          </span>
        </p>
      )}
    </div>
  );
};

export default SourceCard;
