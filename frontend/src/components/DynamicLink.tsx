"use client";
import { Link as MuiLink, LinkProps as MuiLinkProps } from "@mui/material";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { ForwardedRef, forwardRef } from "react";

// @ts-expect-error fixme: bad routing types
type CustomNextLinkProps = Omit<NextLinkProps, "href"> & {
  // @ts-expect-error fixme: bad routing types
  _href: NextLinkProps["href"];
};

const CustomNextLink = forwardRef(
  // @ts-expect-error fixme: bad routing types
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
  // @ts-expect-error fixme: bad routing types
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
      color={props.color ?? "info"}
      variant={props.variant ?? "body2"}
      underline={props.underline ?? "hover"}
    />
  );
};

export default DynamicLink;
