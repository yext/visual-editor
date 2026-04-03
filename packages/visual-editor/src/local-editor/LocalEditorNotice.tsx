import React from "react";
import { shellStyles } from "./styles.ts";

type LocalEditorNoticeProps = {
  title: string;
  body: string;
  tone: "warning" | "error";
};

export const LocalEditorNotice = ({
  title,
  body,
  tone,
}: LocalEditorNoticeProps) => {
  return (
    <div
      style={{
        ...shellStyles.notice,
        ...(tone === "error"
          ? shellStyles.errorNotice
          : shellStyles.warningNotice),
      }}
    >
      <strong>{title}</strong>
      <div>{body}</div>
    </div>
  );
};
