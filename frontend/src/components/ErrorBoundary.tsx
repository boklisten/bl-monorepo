import { Alert, AlertTitle, Grid } from "@mui/material";
import { useEffect } from "react";

import DynamicLink from "@/components/DynamicLink";
import Logo from "@/components/Logo";

export default function ErrorBoundary({
  error,
  withLogo,
  href,
}: {
  error: Error & { digest?: string };
  withLogo?: boolean;
  href?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Grid
      container
      direction={"column"}
      gap={2}
      sx={{
        mt: 7,
        width: "100%",
        alignItems: "center",
      }}
    >
      {withLogo && <Logo variant={"blue"} />}
      <Alert severity={"error"}>
        <AlertTitle>Oisann! Her gikk noe veldig galt!</AlertTitle>
        Du kan prøve å laste inn siden på nytt, eller gå tilbake til forsiden.
        Ta kontakt på teknisk@boklisten.no dersom problemet vedvarer!
      </Alert>
      {href && <DynamicLink href={href}>Gå til forsiden</DynamicLink>}
    </Grid>
  );
}
