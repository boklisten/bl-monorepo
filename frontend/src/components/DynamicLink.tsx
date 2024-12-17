"use client";
import { Link as MuiLink, LinkProps as MuiLinkProps } from "@mui/material";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { ForwardedRef, forwardRef } from "react";

type CustomNextLinkProps = Omit<NextLinkProps, "href"> & {
  _href: NextLinkProps["href"];
};

const CustomNextLink = forwardRef(
  (
    { _href, ...props }: CustomNextLinkProps,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => <NextLink href={_href} ref={ref} {...props} />,
);
CustomNextLink.displayName = "CustomNextLink";

// combine MUI LinkProps with NextLinkProps
// remove both href properties
// and define a new href property using NextLinkProps
type DynamicLinkProps = Omit<MuiLinkProps<typeof NextLink>, "href"> & {
  href: NextLinkProps["href"];
  testID?: string;
};
const DynamicLink = ({ href, testID, ...props }: DynamicLinkProps) => {
  return (
    <MuiLink
      {...props}
      component={CustomNextLink}
      _href={href}
      data-testid={testID}
      variant={props.variant ?? "body2"}
      underline={props.underline ?? "none"}
    />
  );
};

export default DynamicLink;
