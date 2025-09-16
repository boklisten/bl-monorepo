import { Branch } from "@boklisten/backend/shared/branch";
import {
  Anchor,
  Button,
  Divider,
  Select,
  SelectProps,
  Stack,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import SelectBranchTreeView from "@/features/branches/SelectBranchTreeView";
import unpack from "@/shared/api/bl-api-request";
import { publicApiClient } from "@/shared/api/publicApiClient";
import { useFieldContext } from "@/shared/form/hooks";
import InfoAlert from "@/shared/ui/components/alerts/InfoAlert";

export default function SelectBranchField(
  props: SelectProps & { perspective: "personal" | "administrate" | string },
) {
  const field = useFieldContext<string | null>();
  const branchQuery = {
    query: { active: true, sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [publicApiClient.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      publicApiClient
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });

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
                <Anchor
                  component={Link}
                  underline={"never"}
                  size={"sm"}
                  href={"mailto:info@boklisten.no"}
                >
                  info@boklisten.no
                </Anchor>
                , så hjelper vi deg!
              </InfoAlert>
              <Divider w={"100%"} label={"eller"} />
              <Button variant={"subtle"} onClick={() => modals.close(modalId)}>
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
