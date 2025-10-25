import { Center, Stack } from "@mantine/core";
import { useEffect } from "react";

import Logo from "@/features/layout/Logo";
import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import NextAnchor from "@/shared/components/NextAnchor";

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
      <ErrorAlert title={"Oisann! Her gikk noe veldig galt!"}>
        Du kan prøve å laste inn siden på nytt, eller gå tilbake til forsiden.
        Ta kontakt på teknisk@boklisten.no dersom problemet vedvarer!
      </ErrorAlert>
      <Center>
        {href && (
          // @ts-expect-error fixme: bad link types
          <NextAnchor href={href}>Gå til forsiden</NextAnchor>
        )}
      </Center>
    </Stack>
  );
}
