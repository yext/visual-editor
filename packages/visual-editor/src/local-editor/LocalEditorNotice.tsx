import React from "react";

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
        borderRadius: "12px",
        padding: "12px 14px",
        marginBottom: "12px",
        border: "1px solid transparent",
        ...(tone === "error"
          ? {
              background: "#fff1f0",
              borderColor: "#f2a8a2",
            }
          : {
              background: "#fff8e8",
              borderColor: "#f4d58d",
            }),
      }}
    >
      <strong>{title}</strong>
      <div>{body}</div>
    </div>
  );
};
