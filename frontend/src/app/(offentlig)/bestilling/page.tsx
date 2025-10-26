import { Branch } from "@boklisten/backend/shared/branch";
import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import SelectOrderBranch from "@/features/order/SelectOrderBranch";
import unpack from "@/shared/utils/bl-api-request";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export const metadata: Metadata = {
  title: "Bestill bøker",
  description:
    "Velg hvilken skole og hvilke fag du tar, så finner vi bøkene du trenger for deg!",
};

const branchQuery = {
  query: { active: true, "isBranchItemsLive.online": true, sort: "name" },
};

export default async function OrderPage() {
  "use cache";
  const cachedBranches = await publicApiClient
    .$route("collection.branches.getAll")
    .$get(branchQuery)
    .then(unpack<Branch[]>);
  return (
    <Container size={"md"}>
      <Stack gap={"xs"}>
        <Title>Hvor går du på skole?</Title>
        <SelectOrderBranch cachedBranches={cachedBranches} />
      </Stack>
    </Container>
  );
}
