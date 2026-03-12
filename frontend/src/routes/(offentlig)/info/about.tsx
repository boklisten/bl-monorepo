import EditableTextReadOnly from "@/shared/components/EditableTextReadOnly";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/info/about")({
  head: () => ({
    meta: [
      { title: "Om oss | Boklisten.no" },
      {
        description:
          "Boklisten har mange års erfaring med kjøp og salg av pensumbøker. Les om vår historie, hvem vi er, og hva vi tilbyr.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return <EditableTextReadOnly dataKey={"om_oss"} />;
}
