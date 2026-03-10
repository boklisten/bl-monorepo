import { createLink, type LinkComponent } from "@tanstack/react-router";
import { Anchor, type AnchorProps } from "@mantine/core";
import { forwardRef } from "react";

const MantineLinkComponent = forwardRef<HTMLAnchorElement, Omit<AnchorProps, "href">>(
  (props, ref) => {
    return <Anchor ref={ref} {...props} />;
  },
);

const CreatedLinkComponent = createLink(MantineLinkComponent);

const TanStackAnchor: LinkComponent<typeof MantineLinkComponent> = (props) => {
  return <CreatedLinkComponent preload="viewport" {...props} />;
};

export default TanStackAnchor;
