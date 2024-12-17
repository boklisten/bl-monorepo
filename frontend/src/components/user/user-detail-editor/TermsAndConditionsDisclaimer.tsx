import { Typography } from "@mui/material";

import DynamicLink from "@/components/DynamicLink";

export default function TermsAndConditionsDisclaimer() {
  return (
    <Typography>
      {"Jeg godtar Boklistens "}
      <DynamicLink
        href={"/info/policies/conditions"}
        target={"_blank"}
        variant={"body1"}
        underline={"hover"}
      >
        betingelser
      </DynamicLink>
      {" og "}
      <DynamicLink
        href={"/info/policies/terms"}
        target={"_blank"}
        variant={"body1"}
        underline={"hover"}
      >
        vilkår
      </DynamicLink>{" "}
      *
    </Typography>
  );
}
