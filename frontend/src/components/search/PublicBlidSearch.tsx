"use client";
import { PublicBlidLookupResult } from "@boklisten/backend/shared/public_blid_lookup";
import {
  ActionIcon,
  Card,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMail, IconObjectScan, IconPhone } from "@tabler/icons-react";
import moment from "moment";
import { useState } from "react";

import ScannerModal from "@/components/scanner/ScannerModal";
import useApiClient from "@/utils/api/useApiClient";

export default function PublicBlidSearch() {
  const client = useApiClient();
  const [isOpen, { open, close }] = useDisclosure();
  const [blidSearch, setBlidSearch] = useState("");
  const [searchResult, setSearchResult] = useState<
    PublicBlidLookupResult | "inactive" | null
  >(null);

  async function onBlidSearch(blid: string) {
    setSearchResult(null);
    close();
    setBlidSearch(blid);
    if (blid.length !== 8 && blid.length !== 12) {
      // Only lookup for valid blids
      return;
    }
    try {
      const [result] = await client
        .public_blid_lookup({ blid })
        .$get()
        .unwrap();
      if (result) {
        setSearchResult(result);
      } else {
        setSearchResult("inactive");
      }
    } catch (error) {
      console.error(error);
      setSearchResult("inactive");
    }
  }

  return (
    <>
      <TextInput
        placeholder={"12345678"}
        label={"Unik ID"}
        onChange={(event) => onBlidSearch(event.target.value)}
        rightSection={
          <Tooltip label={"Åpne scanner"}>
            <ActionIcon variant={"subtle"} onClick={open}>
              <IconObjectScan />
            </ActionIcon>
          </Tooltip>
        }
      />
      <Text c={"gray"} size={"sm"} ta={"center"}>
        {searchResult === "inactive" &&
          "Denne boken er ikke registrert som utdelt."}
        {((searchResult === null &&
          blidSearch.length !== 8 &&
          blidSearch.length !== 12) ||
          blidSearch.length === 0) &&
          "Venter på unik ID"}
      </Text>
      {searchResult !== "inactive" && searchResult !== null && (
        <>
          <Text size={"xl"} ta={"center"}>
            Denne boken tilhører
          </Text>
          <Card shadow="xl" withBorder>
            <Stack>
              <Title order={4} ta={"center"}>
                {searchResult.name}
              </Title>
              <Stack align={"center"} gap={"xs"}>
                <Group gap={5} justify={"center"}>
                  <IconPhone />
                  <Text>{searchResult.phone}</Text>
                </Group>
                <Group gap={5} justify={"center"}>
                  <IconMail />
                  <Text>{searchResult.email}</Text>
                </Group>
              </Stack>

              <Table verticalSpacing={"md"} ta={"left"} layout={"fixed"}>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Th>Tittel</Table.Th>
                    <Table.Td>{searchResult.title}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>ISBN</Table.Th>
                    <Table.Td>{searchResult.isbn}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Utdelt hos</Table.Th>
                    <Table.Td>{searchResult.handoutBranch}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Utdelt den</Table.Th>
                    <Table.Td>
                      {moment(searchResult.handoutTime).format("DD/MM/YYYY")}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Frist</Table.Th>
                    <Table.Td>
                      {moment(searchResult.deadline).format("DD/MM/YYYY")}
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        </>
      )}
      <ScannerModal
        onScan={async (blid) => {
          onBlidSearch(blid);
          return [{ feedback: "" }] as [{ feedback: string }];
        }}
        open={isOpen}
        handleClose={close}
      />
    </>
  );
}
