import { Button } from "@mantine/core";
import TanStackAnchor from "@/shared/components/TanStackAnchor.tsx";

export default function OrderButton() {
  return (
    <Button size={"lg"} component={TanStackAnchor} to={"/bestilling"} underline={"never"}>
      Bestill bøker
    </Button>
  );
}
