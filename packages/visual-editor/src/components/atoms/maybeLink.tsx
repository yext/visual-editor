import * as React from "react";
import { CTA } from "./cta.tsx";
import { ThemeColor } from "../../utils/themeConfigOptions.ts";

export type MaybeLinkProps = {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  eventName?: string;
  actionId?: string;
  color?: ThemeColor;
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
    color,
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
        actionId={props.actionId}
        color={color}
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
