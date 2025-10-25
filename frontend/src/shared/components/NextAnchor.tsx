"use client";

import { Anchor, AnchorProps } from "@mantine/core";
import Link, { type LinkProps } from "next/link";

export default function NextAnchor<R extends string>(
  props: AnchorProps & LinkProps<R>,
) {
  // @ts-expect-error fixme: bad routing types
  return <Anchor component={Link} {...props} />;
}
