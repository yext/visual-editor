import * as React from "react";
import { CTAProps, CTA } from "@yext/visual-editor";

export type MaybeLinkProps = {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  eventName?: string;
  variant?: CTAProps["variant"];
  alwaysHideCaret?: boolean;
};

export const MaybeLink = (props: MaybeLinkProps) => {
  const {
    href,
    children,
    className,
    eventName,
    alwaysHideCaret,
    variant = "link",
  } = props;

  if (href) {
    return (
      <CTA
        link={href}
        label={children}
        linkType="URL"
        eventName={eventName}
        variant={variant}
        className={className}
        alwaysHideCaret={alwaysHideCaret}
      />
    );
  } else {
    return <span className={className}>{props.children}</span>;
  }
};
