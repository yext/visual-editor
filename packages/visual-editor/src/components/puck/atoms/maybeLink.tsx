import * as React from "react";
import { Link } from "@yext/pages-components";

type maybeLinkProps = {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  eventName?: string;
};

const MaybeLink = (props: maybeLinkProps) => {
  if (props.href) {
    return (
      <Link href={props.href} {...props}>
        {props.children}
      </Link>
    );
  } else {
    return <>{props.children}</>;
  }
};

export { MaybeLink };
