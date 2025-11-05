"use client";

import { Button } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";

import { useAppForm } from "@/shared/hooks/form";

const defaultValues: {
  recipients: {
    email?: string;
    phone?: string;
    smsText?: string;
    templateId?: string;
  }[];
} = {
  recipients: [],
};

export default function DispatchManager() {
  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });
  return (
    <>
      <form.AppField name={"recipients"}>
        {(field) => (
          <field.CsvFileField
            label={"Mottakere"}
            headers={[
              { label: "phone" },
              { label: "email" },
              { label: "smsText" },
              { label: "templateId" },
            ]}
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.ErrorSummary />
      </form.AppForm>
      <Button leftSection={<IconSend />} onClick={form.handleSubmit}>
        Send
      </Button>
    </>
  );
}
