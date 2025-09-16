"use client";
import { Branch } from "@boklisten/backend/shared/branch";
import { CustomerItemType } from "@boklisten/backend/shared/customer-item/customer-item-type";
import { MessageMethod } from "@boklisten/backend/shared/message/message-method/message-method";
import { Button, Grid, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconMailFast, IconSend } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import { useAppForm } from "@/hooks/form";
import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";
import {
  showErrorNotification,
  showInfoNotification,
  showSuccessNotification,
} from "@/utils/notifications";
import { calculateSmsSegmentFeedback } from "@/utils/sms";

const SENDGRID_TEMPLATE_ID_REGEX = /^d-[0-9a-f]{32}$/;

interface RemindersFormData {
  branchIds: string[];
  deadline: string;
  customerItemType: CustomerItemType;
  messageMethod: MessageMethod;
  emailTemplateId: string | null;
  smsText: string | null;
}

const defaultValues: RemindersFormData = {
  branchIds: [],
  deadline: "",
  customerItemType: "rent",
  messageMethod: MessageMethod.SMS,
  emailTemplateId: "",
  smsText: "",
};

export default function Reminders() {
  const client = useApiClient();

  const { data: branches } = useQuery({
    queryKey: [
      client.$url("collection.branches.getAll", {
        query: { active: true, sort: "name" },
      }),
    ],
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get({
          query: { active: true, sort: "name" },
        })
        .then(unpack<Branch[]>),
  });

  const countRecipientsMutation = useMutation({
    mutationFn: (formData: RemindersFormData) =>
      client.reminders.count_recipients
        .$post({
          deadlineISO: dayjs(formData.deadline).toISOString(),
          customerItemType: formData.customerItemType,
          branchIDs: formData.branchIds,
          emailTemplateId: formData.emailTemplateId,
          smsText: formData.smsText,
        })
        .unwrap(),
    onError: () =>
      showErrorNotification("Klarte ikke beregne antall mottakere"),
  });

  const sendReminderMutation = useMutation({
    mutationFn: (formData: RemindersFormData) =>
      client.reminders.send
        .$post({
          deadlineISO: dayjs(formData.deadline).toISOString(),
          customerItemType: formData.customerItemType,
          branchIDs: formData.branchIds,
          emailTemplateId: formData.emailTemplateId,
          smsText: formData.smsText,
        })
        .unwrap(),
    onError: () => showErrorNotification("Klarte ikke sende påminnelse"),
    onSuccess: () =>
      showSuccessNotification({
        icon: <IconMailFast />,
        title: "Påminnelse ble sendt!",
        message: `Husk å sjekke status hos Twilio / SendGrid for å bekrefte at påminnelsen har kommet frem`,
      }),
  });

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const { recipientCount } = await countRecipientsMutation.mutateAsync(
        form.state.values,
      );
      if (recipientCount === 0) {
        showInfoNotification("Fant ingen kunder med valgte innstillinger");
        return;
      }
      modals.openConfirmModal({
        title: "Bekreft utsending av påminnelse",
        children: (
          <Text size="sm">
            Du er nå i ferd med å sende en påminnelse på{" "}
            {value.messageMethod === "sms" ? "sms" : "e-post"} til{" "}
            {recipientCount} kunder.
          </Text>
        ),
        labels: { confirm: "Send", cancel: "Avbryt" },
        confirmProps: { leftSection: <IconSend /> },
        onConfirm: () => sendReminderMutation.mutate(value),
      });
    },
  });

  return (
    <>
      <form.AppField
        name={"branchIds"}
        validators={{
          onChange: ({ value }) =>
            value.length === 0 ? "Du må velge minst en filial" : null,
        }}
      >
        {(field) => (
          <field.MultiSelectField
            label={"Filialer"}
            placeholder={"Velg filialer"}
            data={(branches ?? []).map((branch) => ({
              value: branch.id,
              label: branch.name,
            }))}
            clearable
            searchable
          />
        )}
      </form.AppField>
      <form.AppField
        name={"deadline"}
        validators={{
          onSubmit: ({ value }) => {
            if (!value) return "Du må velge en frist";
            return null;
          },
        }}
      >
        {(field) => <field.DeadlinePickerField />}
      </form.AppField>
      <Grid>
        <Grid.Col span={{ base: 12, xs: 6 }}>
          <form.AppField name={"customerItemType"}>
            {(field) => (
              <field.SegmentedControlField
                label={"Kundetype"}
                data={[
                  { value: "rent", label: "VGS" },
                  { value: "partly-payment", label: "Privatist" },
                ]}
              />
            )}
          </form.AppField>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6 }}>
          <form.AppField name={"messageMethod"}>
            {(field) => (
              <field.SegmentedControlField
                label={"Meldingstype"}
                data={[
                  { value: MessageMethod.SMS, label: "SMS" },
                  { value: MessageMethod.EMAIL, label: "E-post" },
                ]}
              />
            )}
          </form.AppField>
        </Grid.Col>
      </Grid>
      <form.Subscribe selector={(state) => state.values.messageMethod}>
        {(messageMethod) =>
          messageMethod === MessageMethod.SMS ? (
            <form.AppField
              name={"smsText"}
              validators={{
                onChangeListenTo: ["messageMethod"],
                onChange: ({ value }) =>
                  form.state.values.messageMethod === "sms" &&
                  (!value || value.length === 0)
                    ? "Du må fylle inn melding"
                    : null,
              }}
            >
              {(field) => (
                <field.TextAreaField
                  label={"Melding"}
                  description={calculateSmsSegmentFeedback(
                    field.state.value ?? "",
                  )}
                  placeholder={"Hei! [...] Mvh, Boklisten.no"}
                  autosize
                  minRows={2}
                  maxRows={10}
                />
              )}
            </form.AppField>
          ) : (
            <form.AppField
              name={"emailTemplateId"}
              validators={{
                onChangeListenTo: ["messageMethod"],
                onChange: ({ value }) => {
                  if (form.state.values.messageMethod !== "email") return null;

                  if (!value || value.length === 0)
                    return "Du må fylle inn template ID";

                  if (!SENDGRID_TEMPLATE_ID_REGEX.test(value))
                    return "Du må fylle inn en gyldig SendGrid Template ID";

                  return null;
                },
              }}
            >
              {(field) => (
                <field.TextField
                  label={"Template ID"}
                  placeholder={"d-123456789"}
                />
              )}
            </form.AppField>
          )
        }
      </form.Subscribe>
      <form.AppForm>
        <form.ErrorSummary />
      </form.AppForm>
      <Button
        leftSection={<IconSend />}
        onClick={form.handleSubmit}
        loading={
          countRecipientsMutation.isPending || sendReminderMutation.isPending
        }
      >
        Send
      </Button>
    </>
  );
}
