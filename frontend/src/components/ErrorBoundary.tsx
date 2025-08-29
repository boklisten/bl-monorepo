import { Alert, Center, Stack } from "@mantine/core";
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
    <Stack align={"center"}>
      {withLogo && <Logo variant={"blue"} />}
      <Alert color={"red"} title={"Oisann! Her gikk noe veldig galt!"}>
        Du kan prøve å laste inn siden på nytt, eller gå tilbake til forsiden.
        Ta kontakt på teknisk@boklisten.no dersom problemet vedvarer!
      </Alert>
      <Center>
        {href && <DynamicLink href={href}>Gå til forsiden</DynamicLink>}
      </Center>
    </Stack>
  );
}
