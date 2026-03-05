// @ts-nocheck
import * as React from "react";

export interface YetiHeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}

export const YetiHeading = ({
  level = 2,
  className,
  children,
}: YetiHeadingProps) => {
  const Tag = `h${level}` as unknown as keyof JSX.IntrinsicElements;
  return <Tag className={className}>{children}</Tag>;
};
