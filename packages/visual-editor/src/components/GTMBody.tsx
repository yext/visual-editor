import React from "react";
import { useDocument } from "@yext/visual-editor";

/**
 * Adds the Google Tag Manager (noscript) iframe to the body.
 * This is required for GTM to function properly when JavaScript is disabled.
 */
export const GTMBody: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const streamDocument = useDocument();

  if (!streamDocument?.__?.visualEditorConfig) {
    return <>{children}</>;
  }

  const googleTagManagerId: string = JSON.parse(
    streamDocument.__.visualEditorConfig
  )?.googleTagManagerId;

  if (!googleTagManagerId) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Google Tag Manager (noscript) */}
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      ></iframe>
      {/* End Google Tag Manager (noscript) */}

      {children}
    </>
  );
};
