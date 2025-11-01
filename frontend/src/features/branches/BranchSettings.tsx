import { Branch } from "@boklisten/backend/shared/branch";
import { Period } from "@boklisten/backend/shared/period";
import { Button, Card, Fieldset, Group, Stack, Title } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Activity } from "react";

import UploadClassMemberships from "@/features/branches/UploadClassMemberships";
import UploadSubjectChoices from "@/features/branches/UploadSubjectChoices";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
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
      <Activity mode={existingBranch ? "visible" : "hidden"}>
        <form.Subscribe selector={(state) => state.values.name}>
          {(field) => <Title>{field || existingBranch?.name}</Title>}
        </form.Subscribe>
      </Activity>
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
      <form.Subscribe selector={(state) => state.values.type}>
        {(field) => (
          <>
            <Activity mode={!field ? "visible" : "hidden"}>
              <Fieldset legend={"Perioder"}>
                <InfoAlert title={"Ingen filialtype valgt"}>
                  Du må velge filialtype for å kunne legge inn leie- eller
                  delbetalingsperioder
                </InfoAlert>
              </Fieldset>
            </Activity>
            <Activity mode={field === "VGS" ? "visible" : "hidden"}>
              <Fieldset legend={"Leieperioder"}>
                <Stack align={"center"}>
                  <form.AppField name="paymentInfo.rentPeriods" mode="array">
                    {(field) => (
                      <>
                        {field.state.value.map((_, i) => (
                          <Card key={`rent-${i}`} withBorder w={"100%"}>
                            <Stack>
                              <Group align={"end"} justify={"center"}>
                                <form.AppField
                                  name={`paymentInfo.rentPeriods[${i}].type`}
                                >
                                  {(subField) => (
                                    <subField.SelectField
                                      label={"Type"}
                                      data={[
                                        {
                                          label: "semester",
                                          value: "semester",
                                        },
                                        { label: "år", value: "year" },
                                      ]}
                                    />
                                  )}
                                </form.AppField>
                                <form.AppField
                                  name={`paymentInfo.rentPeriods[${i}].maxNumberOfPeriods`}
                                >
                                  {(subField) => (
                                    <subField.NumberField
                                      label={"Grense"}
                                      allowNegative={false}
                                      allowDecimal={false}
                                    />
                                  )}
                                </form.AppField>
                                <form.AppField
                                  name={`paymentInfo.rentPeriods[${i}].percentage`}
                                >
                                  {(subField) => (
                                    <subField.PercentageField
                                      label={"Prosent"}
                                    />
                                  )}
                                </form.AppField>
                                <form.AppField
                                  name={`paymentInfo.rentPeriods[${i}].date`}
                                >
                                  {(subField) => (
                                    <subField.DeadlinePickerField
                                      clearable={false}
                                      label={"Frist"}
                                    />
                                  )}
                                </form.AppField>
                                <Button
                                  bg={"red"}
                                  onClick={() =>
                                    field.setValue(
                                      field.state.value.toSpliced(i, 1),
                                    )
                                  }
                                >
                                  Fjern
                                </Button>
                              </Group>
                            </Stack>
                          </Card>
                        ))}
                        <Button
                          onClick={() =>
                            field.setValue(
                              field.state.value.concat([
                                {
                                  type: "semester",
                                  maxNumberOfPeriods: 1,
                                  percentage: 1,
                                  date: dayjs().format("YYYY-MM-DD"),
                                },
                              ]),
                            )
                          }
                        >
                          Legg til
                        </Button>
                      </>
                    )}
                  </form.AppField>
                </Stack>
              </Fieldset>
            </Activity>
            <Activity mode={field === "privatist" ? "visible" : "hidden"}>
              <Fieldset legend={"Delbetalingsperioder"}>
                <Stack align={"center"}>
                  <form.AppField
                    name="paymentInfo.partlyPaymentPeriods"
                    mode="array"
                  >
                    {(field) => (
                      <>
                        {field.state.value.map((_, i) => (
                          <Card
                            key={`partlyPayment-${i}`}
                            withBorder
                            w={"100%"}
                          >
                            <Stack>
                              <form.AppField
                                name={`paymentInfo.partlyPaymentPeriods[${i}].type`}
                              >
                                {(subField) => (
                                  <subField.SelectField
                                    label={"Type"}
                                    data={[
                                      {
                                        label: "semester",
                                        value: "semester",
                                      },
                                      { label: "år", value: "year" },
                                    ]}
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                name={`paymentInfo.partlyPaymentPeriods[${i}].percentageUpFront`}
                              >
                                {(subField) => (
                                  <subField.PercentageField
                                    label={"Første betaling"}
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                name={`paymentInfo.partlyPaymentPeriods[${i}].percentageUpFrontUsed`}
                              >
                                {(subField) => (
                                  <subField.PercentageField
                                    label={"Første betaling (brukt)"}
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                name={`paymentInfo.partlyPaymentPeriods[${i}].percentageBuyout`}
                              >
                                {(subField) => (
                                  <subField.PercentageField
                                    label={"Utkjøpsprosent"}
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                name={`paymentInfo.partlyPaymentPeriods[${i}].percentageBuyoutUsed`}
                              >
                                {(subField) => (
                                  <subField.PercentageField
                                    label={"Utkjøpsprosent (brukt)"}
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                name={`paymentInfo.partlyPaymentPeriods[${i}].date`}
                              >
                                {(subField) => (
                                  <subField.DeadlinePickerField
                                    clearable={false}
                                    label={"Frist"}
                                  />
                                )}
                              </form.AppField>
                              <Group>
                                <Button
                                  bg={"red"}
                                  onClick={() =>
                                    field.setValue(
                                      field.state.value.toSpliced(i, 1),
                                    )
                                  }
                                >
                                  Fjern
                                </Button>
                              </Group>
                            </Stack>
                          </Card>
                        ))}
                        <Button
                          onClick={() =>
                            field.setValue(
                              field.state.value.concat([
                                {
                                  type: "semester",
                                  percentageBuyout: 1,
                                  percentageBuyoutUsed: 1,
                                  percentageUpFront: 1,
                                  percentageUpFrontUsed: 1,
                                  date: dayjs().format("YYYY-MM-DD"),
                                },
                              ]),
                            )
                          }
                        >
                          Legg til
                        </Button>
                      </>
                    )}
                  </form.AppField>
                </Stack>
              </Fieldset>
            </Activity>
          </>
        )}
      </form.Subscribe>
      <Fieldset legend={"Forlengingsperioder"}>
        <Stack align={"center"}>
          <form.AppField name="paymentInfo.extendPeriods" mode="array">
            {(field) => (
              <>
                {field.state.value.map((_, i) => (
                  <Card key={`extend-${i}`} withBorder w={"100%"}>
                    <Stack>
                      <Group align={"end"} justify={"center"}>
                        <form.AppField
                          name={`paymentInfo.extendPeriods[${i}].type`}
                        >
                          {(subField) => (
                            <subField.SelectField
                              label={"Type"}
                              data={[
                                { label: "semester", value: "semester" },
                                { label: "år", value: "year" },
                              ]}
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`paymentInfo.extendPeriods[${i}].maxNumberOfPeriods`}
                        >
                          {(subField) => (
                            <subField.NumberField
                              label={"Grense"}
                              allowNegative={false}
                              allowDecimal={false}
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`paymentInfo.extendPeriods[${i}].price`}
                        >
                          {(subField) => (
                            <subField.CurrencyField label={"Pris"} />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`paymentInfo.extendPeriods[${i}].date`}
                        >
                          {(subField) => (
                            <subField.DeadlinePickerField
                              clearable={false}
                              label={"Dato"}
                            />
                          )}
                        </form.AppField>
                        <Button
                          bg={"red"}
                          onClick={() =>
                            field.setValue(field.state.value.toSpliced(i, 1))
                          }
                        >
                          Fjern
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                ))}
                <Button
                  onClick={() =>
                    field.setValue(
                      field.state.value.concat([
                        {
                          type: "semester",
                          maxNumberOfPeriods: 1,
                          price: 0,
                          date: dayjs().format("YYYY-MM-DD"),
                        },
                      ]),
                    )
                  }
                >
                  Legg til
                </Button>
              </>
            )}
          </form.AppField>
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
