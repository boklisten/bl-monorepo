import { Button, Stack } from "@mantine/core";

import InfoAlert from "@/components/ui/alerts/InfoAlert";
import { useAppForm } from "@/hooks/form";

export default function ManualBlidSearchModal({
  onSubmit,
}: {
  onSubmit: (scannedText: string) => void;
}) {
  const form = useAppForm({
    defaultValues: {
      blid: "",
    },
    onSubmit: ({ value }) => onSubmit(value.blid),
  });
  return (
    <Stack>
      <InfoAlert>
        Skal kun brukes dersom bokas unike ID ikke lar seg skanne
      </InfoAlert>
      <form.AppForm>
        <form.AppField name={"blid"}>
          {(field) => (
            <field.TextField
              required
              label={"Skriv inn bokas unike ID"}
              placeholder={"8 eller 12 siffer"}
            />
          )}
        </form.AppField>
      </form.AppForm>
      <Button onClick={form.handleSubmit}>Bekreft</Button>
    </Stack>
  );
}
