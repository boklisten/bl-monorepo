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

import SelectBranchTreeView from "@/components/branches/SelectBranchTreeView";
import InfoAlert from "@/components/ui/alerts/InfoAlert";
import { useFieldContext } from "@/hooks/form";
import unpack from "@/utils/bl-api-request";
import { publicApiClient } from "@/utils/publicApiClient";

export default function SelectBranchField(props: SelectProps) {
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

  const modalId = "select-school";
  return (
    <Select
      label={"Skole"}
      placeholder={"Velg din skole"}
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
                label={"Velg din skole"}
                branches={branches ?? []}
                onSelect={(childBranchId) => {
                  field.handleChange(childBranchId);
                  modals.close(modalId);
                }}
                onlyLeafs
              />
              <InfoAlert title={"Finner du ikke din skole eller klasse?"}>
                Kontakt oss på{" "}
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
                Jeg skal ikke ha bøker
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
