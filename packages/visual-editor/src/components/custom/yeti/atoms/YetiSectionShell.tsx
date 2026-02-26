// @ts-nocheck
import * as React from "react";

export interface YetiSectionShellProps {
  children: React.ReactNode;
  backgroundClassName?: string;
  className?: string;
  contentClassName?: string;
}

const join = (...parts: Array<string | undefined>) =>
  parts.filter((part) => part && part.trim().length > 0).join(" ");

export const YetiSectionShell = ({
  children,
  backgroundClassName,
  className,
  contentClassName,
}: YetiSectionShellProps) => {
  return (
    <section
      className={join("w-full px-4 md:px-6", backgroundClassName, className)}
    >
      <div className={join("mx-auto w-full max-w-6xl", contentClassName)}>
        {children}
      </div>
    </section>
  );
};
