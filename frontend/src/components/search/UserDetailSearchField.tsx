import { UserDetail } from "@boklisten/backend/shared/user-detail";
import {
  ActionIcon,
  Autocomplete,
  ComboboxItem,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconMail,
  IconObjectScan,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";

import ScannerModal from "@/components/scanner/ScannerModal";
import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";

export default function UserDetailSearchField({
  onSelectedResult,
}: {
  onSelectedResult: (userDetail: UserDetail | null) => void;
}) {
  const client = useApiClient();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<UserDetail[]>([]);

  async function handleInputChange(newInputValue: string) {
    if (newInputValue.length < 3) {
      onSelectedResult(null);
      setSearchResults([]);
      return;
    }
    try {
      const result = await client
        .$route("collection.userdetails.getAll")
        .$get({
          query: { s: newInputValue },
        })
        .then(unpack<UserDetail[]>);
      setSearchResults(result ?? []);
    } catch {
      setSearchResults([]);
    }
  }

  return (
    <>
      <Autocomplete
        label={"Kundesøk"}
        description={
          "Søk opp en kunde eller skann kundeID for å starte utdeling"
        }
        placeholder={"Søk etter telefonnummer, e-post, navn eller adresse"}
        value={searchValue}
        rightSection={
          <ActionIcon
            variant={"subtle"}
            onClick={() => {
              modals.open({
                title: "Scann kundeID",
                children: (
                  <ScannerModal
                    onScan={async (scannedText) => {
                      const userDetail = await client.v2.user_details
                        .id({ detailsId: scannedText })
                        .$get()
                        .unwrap();
                      setSearchValue(userDetail?.name ?? "");
                      onSelectedResult(userDetail);
                      return [{ feedback: "" }];
                    }}
                    onSuccessfulScan={modals.closeAll}
                    disableValidation
                  />
                ),
              });
            }}
          >
            <IconObjectScan />
          </ActionIcon>
        }
        clearable
        data={searchResults.map((userDetail) => ({
          value: userDetail.id,
          label: userDetail.name,
        }))}
        filter={({ options, search }) =>
          (options as ComboboxItem[]).filter(({ value }) => {
            const userDetail =
              searchResults.find((sr) => sr.id === value) ?? null;
            if (!userDetail) return false;

            return JSON.stringify(userDetail)
              .trim()
              .toLowerCase()
              .includes(search.trim().toLowerCase());
          })
        }
        onChange={async (value) => {
          setSearchValue(value);
          await handleInputChange(value);
        }}
        onOptionSubmit={(value) => {
          const foundUserDetail =
            searchResults.find((sr) => sr.id === value) ?? null;
          onSelectedResult(foundUserDetail);
        }}
        renderOption={({ option }) => {
          const userDetail = searchResults.find((sr) => sr.id === option.value);
          if (!userDetail) return null;

          return (
            <Stack gap={"xs"}>
              <Group gap={5}>
                <IconUser />
                <Text>{userDetail.name}</Text>
              </Group>
              <Group>
                <Group gap={5}>
                  <IconPhone />
                  <Text>{userDetail.phone}</Text>
                </Group>
                <Group gap={5}>
                  <IconMail />
                  <Text>{userDetail.email}</Text>
                </Group>
              </Group>
            </Stack>
          );
        }}
      />
    </>
  );
}
