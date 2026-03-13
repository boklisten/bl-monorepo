import { Anchor, Button, Divider, Select, type SelectProps, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";

import InfoAlert from "@/shared/components/alerts/InfoAlert";
import SelectBranchTreeView from "@/shared/components/SelectBranchTreeView";
import { useFieldContext } from "@/shared/hooks/form";
import { publicApi } from "@/shared/utils/publicApiClient";

export default function SelectBranchField(
  props: SelectProps & { perspective: "personal" | "administrate" | string },
) {
  const field = useFieldContext<string | null>();
  const { data: branches } = useQuery(publicApi.branches.getPublic.queryOptions());

  const placeholder = `Velg ${props.perspective === "personal" ? "din" : "kundens"} skole`;
  const modalId = "select-school";
  return (
    <Select
      label={"Skole"}
      placeholder={placeholder}
      clearable
      data={
        branches?.map((branch) => ({
          value: branch.id,
          label: branch.name,
        })) ?? []
      }
      dropdownOpened={false}
      onDropdownOpen={() =>
        modals.open({
          modalId,
          withCloseButton: false,
          children: (
            <Stack>
              <SelectBranchTreeView
                label={placeholder}
                branches={branches ?? []}
                onSelect={(childBranchId) => {
                  field.handleChange(childBranchId);
                  modals.close(modalId);
                }}
                onlyLeafs
              />
              <InfoAlert
                title={`Finner du ikke ${props.perspective === "personal" ? "din" : "kundens"} skole eller klasse?`}
              >
                Ta kontakt på{" "}
                <Anchor underline={"never"} size={"sm"} href={"mailto:info@boklisten.no"}>
                  info@boklisten.no
                </Anchor>
                , så hjelper vi deg!
              </InfoAlert>
              <Divider w={"100%"} label={"eller"} />
              <Button
                variant={"subtle"}
                onClick={() => {
                  field.handleChange(null);
                  modals.close(modalId);
                }}
              >
                {props.perspective === "personal"
                  ? "Jeg skal ikke ha bøker"
                  : "Kunden skal ikke ha bøker"}
              </Button>
            </Stack>
          ),
        })
      }
      {...props}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
