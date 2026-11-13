import { themeManagerCn } from "../../utils/cn.ts";
import * as React from "react";
import { CTAVariant, CTA } from "./cta.tsx";
import { ThemeColor, type TypographyRole } from "../../utils/themeOptions.ts";

export type MaybeLinkProps = {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  eventName?: string;
  variant?: CTAVariant;
  color?: ThemeColor;
  typographyRole?: TypographyRole;
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
    color,
    typographyRole,
    ariaLabel,
    disabled = false,
  } = props;

  if (href) {
    return (
      <CTA
        link={href}
        label={children}
        linkType="URL"
        normalizeLink={false}
        eventName={eventName}
        variant={variant}
        color={color}
        typographyRole={typographyRole}
        className={className}
        alwaysHideCaret={alwaysHideCaret}
        ariaLabel={ariaLabel}
        disabled={disabled}
      />
    );
  } else {
    return (
      <span
        className={themeManagerCn(
          typographyRole && `ve-theme-${typographyRole}`,
          className
        )}
      >
        {props.children}
      </span>
    );
  }
};
