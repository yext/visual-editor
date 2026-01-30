import * as React from "react";
import { CTAVariant, CTA } from "./cta.tsx";

export type MaybeLinkProps = {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  eventName?: string;
  variant?: CTAVariant;
  alwaysHideCaret?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
};

export const MaybeLink = (props: MaybeLinkProps) => {
  const {
    href,
    children,
    className,
    eventName,
    alwaysHideCaret,
    variant = "link",
    ariaLabel,
    disabled = false,
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
        ariaLabel={ariaLabel}
        disabled={disabled}
      />
    );
  } else {
    return <span className={className}>{props.children}</span>;
  }
};
