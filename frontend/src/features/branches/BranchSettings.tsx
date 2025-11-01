import { Branch } from "@boklisten/backend/shared/branch";
import { Period } from "@boklisten/backend/shared/period";
import { Button, Fieldset, Stack, Title } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Activity } from "react";

import UploadClassMemberships from "@/features/branches/UploadClassMemberships";
import UploadSubjectChoices from "@/features/branches/UploadSubjectChoices";
import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import unpack from "@/shared/utils/bl-api-request";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

interface DetailedBranch {
  name: string;
  parentBranch: string;
  localName: string;
  childBranches: string[];
  childLabel: string;
  type: string | null;
  active: boolean;
  paymentInfo: {
    responsible: boolean;
    responsibleForDelivery: boolean;
    payLater: boolean;
    partlyPaymentPeriods: {
      type: Period;
      date: string;
      percentageBuyout: number;
      percentageBuyoutUsed: number;
      percentageUpFront: number;
      percentageUpFrontUsed: number;
    }[];
    rentPeriods: {
      type: Period;
      date: string;
      maxNumberOfPeriods: number;
      percentage: number;
    }[];
    extendPeriods: {
      type: Period;
      date: string;
      maxNumberOfPeriods: number;
      price: number;
      percentage: number | null;
    }[];
    buyout: {
      percentage: number;
    };
    sell: {
      percentage: number;
    };
  };
  deliveryMethods: {
    branch: boolean;
    byMail: boolean;
  };
  isBranchItemsLive: {
    online: boolean;
    atBranch: boolean;
  };
  location: {
    region: string;
    address: string;
  };
}

export default function BranchSettings({
  existingBranch,
  onSuccess = () => undefined,
}: {
  existingBranch: Branch | null;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const client = useApiClient();

  const branchQuery = {
    query: { sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [client.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });

  const addBranchMutation = useMutation({
    mutationFn: (newBranch: DetailedBranch) =>
      client.v2.branches.$post(newBranch).unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      }),
    onSuccess: async () => {
      showSuccessNotification("Filial ble opprettet!");
      await queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      });
      onSuccess();
    },
    onError: () => showErrorNotification("Klarte ikke opprette filial!"),
  });

  const updateBranchMutation = useMutation({
    mutationFn: (updatedBranch: DetailedBranch) =>
      client.v2
        .branches({ id: existingBranch?.id ?? "" })
        .$patch(updatedBranch)
        .unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      }),
    onSuccess: () => showSuccessNotification("Filial ble oppdatert!"),
    onError: () => showErrorNotification("Klarte ikke oppdatere filial!"),
  });

  const defaultValues: DetailedBranch = {
    name: existingBranch?.name ?? "",
    localName: existingBranch?.localName ?? "",
    parentBranch: existingBranch?.parentBranch ?? "",
    childBranches: existingBranch?.childBranches ?? [],
    childLabel: existingBranch?.childLabel ?? "",
    location: {
      region: existingBranch?.location.region ?? "",
      address: existingBranch?.location.address ?? "",
    },
    type: existingBranch?.type ?? null,
    active: existingBranch?.active ?? false,
    isBranchItemsLive: {
      online: existingBranch?.isBranchItemsLive?.online ?? false,
      atBranch: existingBranch?.isBranchItemsLive?.atBranch ?? false,
    },
    paymentInfo: {
      responsible: existingBranch?.paymentInfo?.responsible ?? false,
      responsibleForDelivery:
        existingBranch?.paymentInfo?.responsibleForDelivery ?? false,
      payLater: existingBranch?.paymentInfo?.payLater ?? false,
      partlyPaymentPeriods:
        existingBranch?.paymentInfo?.partlyPaymentPeriods?.map(
          (partlyPaymentPeriod) => ({
            ...partlyPaymentPeriod,
            date: dayjs(partlyPaymentPeriod.date).format("YYYY-MM-DD"),
          }),
        ) ?? [],
      rentPeriods:
        existingBranch?.paymentInfo?.rentPeriods?.map((rentPeriod) => ({
          ...rentPeriod,
          date: dayjs(rentPeriod.date).format("YYYY-MM-DD"),
        })) ?? [],
      extendPeriods:
        existingBranch?.paymentInfo?.extendPeriods?.map((extendPeriod) => ({
          ...extendPeriod,
          date: dayjs(extendPeriod.date).format("YYYY-MM-DD"),
          percentage: extendPeriod.percentage ?? null,
        })) ?? [],
      buyout: {
        percentage: existingBranch?.paymentInfo?.buyout?.percentage ?? 1,
      },
      sell: {
        percentage: existingBranch?.paymentInfo?.sell?.percentage ?? 1,
      },
    },
    deliveryMethods: {
      branch: existingBranch?.deliveryMethods?.branch ?? false,
      byMail: existingBranch?.deliveryMethods?.byMail ?? false,
    },
  };

  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) =>
      existingBranch === null
        ? addBranchMutation.mutate(value)
        : updateBranchMutation.mutate(value),
  });

  const branchOptions =
    branches
      ?.filter((branch) => branch.id !== existingBranch?.id)
      .map((branch) => ({
        value: branch.id,
        label: branch.name,
      })) ?? [];

  return (
    <Stack>
      <form.AppField name={"name"}>
        {(field) => (
          <field.TextField
            required
            label={"Fullt navn"}
            placeholder={"Flåklypa videregående skole"}
          />
        )}
      </form.AppField>
      <form.AppField name={"localName"}>
        {(field) => (
          <field.TextField
            required
            label={"Lokalt navn"}
            placeholder={"Flåklypa"}
          />
        )}
      </form.AppField>
      <form.AppField name={"parentBranch"}>
        {(field) => (
          <field.SelectField
            required
            label={"Tilhører"}
            placeholder={"Velg filial"}
            data={branchOptions}
            searchable
            clearable
          />
        )}
      </form.AppField>
      <form.AppField name={"childLabel"}>
        {(field) => (
          <field.TextField
            required
            label={"Delt inn i"}
            placeholder={"årskull, klasse, parallell"}
          />
        )}
      </form.AppField>
      <form.AppField name={"childBranches"}>
        {(field) => (
          <field.MultiSelectField
            required
            label={"Består av"}
            placeholder={"Velg filialer"}
            data={branchOptions}
            searchable
            clearable
          />
        )}
      </form.AppField>
      <form.AppField name={"location.region"}>
        {(field) => (
          <field.TextField
            required
            label={"Region"}
            placeholder={"Oslo, Trondheim, Ski"}
          />
        )}
      </form.AppField>
      <form.AppField name={"location.address"}>
        {(field) => (
          <field.TextField
            label={"Adresse"}
            placeholder={"Postboks 8, 1316 Eiksmarka"}
          />
        )}
      </form.AppField>
      <form.AppField name={"type"}>
        {(field) => (
          <field.SelectField
            data={["privatist", "VGS"]}
            label={"Type"}
            placeholder={"privatist eller VGS"}
            clearable
          />
        )}
      </form.AppField>
      <Fieldset legend={"Synlighet"}>
        <Stack>
          <form.AppField name={"active"}>
            {(field) => <field.SwitchField label={"Aktiv"} />}
          </form.AppField>
          <form.AppField name={"isBranchItemsLive.online"}>
            {(field) => <field.SwitchField label={"Synlig for kunder"} />}
          </form.AppField>
          <form.AppField name={"isBranchItemsLive.atBranch"}>
            {(field) => <field.SwitchField label={"Synlig for ansatte"} />}
          </form.AppField>
        </Stack>
      </Fieldset>
      <Fieldset legend={"Betaling"}>
        <Stack>
          <form.AppField name={"paymentInfo.responsible"}>
            {(field) => <field.SwitchField label={"Ansvarlig for betaling"} />}
          </form.AppField>
          <form.AppField name={"paymentInfo.payLater"}>
            {(field) => <field.SwitchField label={"Betal senere"} />}
          </form.AppField>
          <form.AppField name={"paymentInfo.buyout.percentage"}>
            {(field) => <field.PercentageField label={"Utkjøpsprosent"} />}
          </form.AppField>
          <form.AppField name={"paymentInfo.sell.percentage"}>
            {(field) => <field.PercentageField label={"Innkjøpsprosent"} />}
          </form.AppField>
        </Stack>
      </Fieldset>
      <Fieldset legend={"Levering"}>
        <Stack>
          <form.AppField name={"deliveryMethods.branch"}>
            {(field) => <field.SwitchField label={"Utlevering på filial"} />}
          </form.AppField>
          <form.AppField name={"deliveryMethods.byMail"}>
            {(field) => <field.SwitchField label={"Levering per post"} />}
          </form.AppField>
          <form.Subscribe
            selector={(state) => state.values.deliveryMethods?.byMail}
          >
            {(value) => (
              <Activity mode={value ? "visible" : "hidden"}>
                <form.AppField name={"paymentInfo.responsibleForDelivery"}>
                  {(field) => (
                    <field.SwitchField label={"Gratis postlevering"} />
                  )}
                </form.AppField>
              </Activity>
            )}
          </form.Subscribe>
        </Stack>
      </Fieldset>
      <Button
        color={"green"}
        onClick={form.handleSubmit}
        loading={addBranchMutation.isPending || updateBranchMutation.isPending}
      >
        {existingBranch === null ? "Opprett" : "Lagre"}
      </Button>
      {existingBranch && (
        <Stack gap={"xs"}>
          <Title order={2}>Last opp informasjon</Title>
          <UploadClassMemberships branchId={existingBranch.id} />
          <UploadSubjectChoices branchId={existingBranch.id} />
        </Stack>
      )}
    </Stack>
  );
}
