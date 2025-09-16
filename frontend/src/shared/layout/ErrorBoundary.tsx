import { Anchor, Center, Stack } from "@mantine/core";
import Link from "next/link";
import { useEffect } from "react";

import Logo from "@/shared/layout/Logo";
import ErrorAlert from "@/shared/ui/components/alerts/ErrorAlert";

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
          <Anchor component={Link} href={href}>
            Gå til forsiden
          </Anchor>
        )}
      </Center>
    </Stack>
  );
}
