// @ts-nocheck
import * as React from "react";

export interface YetiParagraphProps {
  className?: string;
  children: React.ReactNode;
}

export const YetiParagraph = ({ className, children }: YetiParagraphProps) => {
  return <p className={className}>{children}</p>;
};
