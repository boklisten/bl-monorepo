import EditableTextReadOnly from "@/shared/components/EditableTextReadOnly";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/info/general")({
  head: () => ({
    meta: [
      { title: "Generell informasjon | Boklisten.no" },
      {
        description:
          "Velkommen til Boklisten.no! Her kan du enkelt kjøpe pensumbøker. Les om vårt konsept, og hvilke tjenester vi tilbyr her.",
      },
    ],
  }),
  component: GeneralInformationPage,
});

function GeneralInformationPage() {
  return <EditableTextReadOnly dataKey={"generell_informasjon"} />;
}
