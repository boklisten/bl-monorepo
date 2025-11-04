import { Button, Card, Group, Skeleton, Stack, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "@tuyau/client";
import { Activity } from "react";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function BranchItemSettings({ branchId }: { branchId: string }) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const {
    data: branchItems,
    isLoading: isLoading,
    isError: isError,
  } = useQuery({
    queryKey: [client.branch_items({ branchId }).$url(), branchId],
    queryFn: () => client.branch_items({ branchId }).$get().unwrap(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: InferRequestType<typeof client.branch_items.$post>) =>
      client.branch_items.$post(data),
    onSuccess: () => showSuccessNotification("Endringene ble lagret!"),
    onError: () => showErrorNotification("Klarte ikke lagre endringene"),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.branch_items({ branchId }).$url(), branchId],
      }),
  });

  const subjects = new Set(
    branchItems?.flatMap((branchItem) => branchItem.subjects) ?? [],
  )
    .values()
    .toArray()
    .filter((v) => v !== undefined)
    .sort((a, b) => a.localeCompare(b));

  const form = useAppForm({
    defaultValues: {
      branchItems: branchItems ?? [],
    },
    onSubmit: ({ value }) =>
      saveMutation.mutate({
        branchId,
        branchItems: value.branchItems,
      }),
  });

  return (
    <Stack>
      <Group>
        <Button leftSection={<IconPlus />}>Legg til</Button>
        <Button
          bg={"green"}
          onClick={form.handleSubmit}
          loading={saveMutation.isPending}
        >
          Lagre
        </Button>
      </Group>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <Skeleton height={280} />
        <Skeleton height={280} />
        <Skeleton height={280} />
        <Skeleton height={280} />
        <Skeleton height={280} />
      </Activity>
      <Activity
        mode={
          !isLoading && (isError || branchItems == undefined)
            ? "visible"
            : "hidden"
        }
      >
        <ErrorAlert title={"Klarte ikke laste inn åpningstider"}>
          {PLEASE_TRY_AGAIN_TEXT}
        </ErrorAlert>
      </Activity>
      <Activity mode={branchItems?.length === 0 ? "visible" : "hidden"}>
        <InfoAlert title={"Ingen bøker"}>
          Denne filialen har ikke tilknyttet noen bøker
        </InfoAlert>
      </Activity>
      <form.AppField name="branchItems" mode="array">
        {(field) =>
          field.state.value.map((branchItem, i) => (
            <Card key={`branch_item-${i}`} withBorder>
              <Stack>
                <Group justify={"space-between"}>
                  <Title order={3}>{branchItem.item.title}</Title>
                  <Button
                    bg={"red"}
                    onClick={() =>
                      field.setValue(
                        field.state.value.filter((v) => v.id !== branchItem.id),
                      )
                    }
                  >
                    Fjern
                  </Button>
                </Group>
                <Group gap={100}>
                  <Stack>
                    <Title order={4}>Bestilling</Title>
                    <form.AppField name={`branchItems[${i}].rent`}>
                      {(subField) => <subField.SwitchField label={"Leie"} />}
                    </form.AppField>
                    <form.AppField name={`branchItems[${i}].partlyPayment`}>
                      {(subField) => (
                        <subField.SwitchField label={"Delbetaling"} />
                      )}
                    </form.AppField>
                    <form.AppField name={`branchItems[${i}].buy`}>
                      {(subField) => <subField.SwitchField label={"Salg"} />}
                    </form.AppField>
                  </Stack>
                  <Stack>
                    <Title order={4}>På filial</Title>
                    <form.AppField name={`branchItems[${i}].rentAtBranch`}>
                      {(subField) => <subField.SwitchField label={"Leie"} />}
                    </form.AppField>
                    <form.AppField
                      name={`branchItems[${i}].partlyPaymentAtBranch`}
                    >
                      {(subField) => (
                        <subField.SwitchField label={"Delbetaling"} />
                      )}
                    </form.AppField>
                    <form.AppField name={`branchItems[${i}].buyAtBranch`}>
                      {(subField) => <subField.SwitchField label={"Salg"} />}
                    </form.AppField>
                  </Stack>
                </Group>
                <form.AppField name={`branchItems[${i}].subjects`}>
                  {(subField) => (
                    <subField.TagsField
                      label={"Fag"}
                      placeholder={"Velg fag"}
                      data={subjects}
                    />
                  )}
                </form.AppField>
              </Stack>
            </Card>
          ))
        }
      </form.AppField>
    </Stack>
  );
}
