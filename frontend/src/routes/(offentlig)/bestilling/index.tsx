import { Container, Stack, Title } from "@mantine/core";
import SelectOrderBranch from "@/features/order/SelectOrderBranch";
import { createFileRoute } from "@tanstack/react-router";
import { publicApiClient } from "@/shared/utils/publicApiClient.ts";
import unpack from "@/shared/utils/bl-api-request.ts";
import type { Branch } from "@boklisten/backend/shared/branch.ts";
import { rootQueryClient } from "@/routes/__root.tsx";
import { queryOptions } from "@tanstack/react-query";

const branchQuery = {
  query: { active: true, "isBranchItemsLive.online": true, sort: "name" },
};

export const Route = createFileRoute("/(offentlig)/bestilling/")({
  head: () => ({
    meta: [
      { title: "Bestill bøker | Boklisten.no" },
      {
        description:
          "Velg hvilken skole og hvilke fag du tar, så finner vi bøkene du trenger for deg!",
      },
    ],
  }),
  loader: async () => {
    rootQueryClient.prefetchQuery(
      queryOptions({
        queryKey: [publicApiClient.$url("collection.branches.getAll", branchQuery)],
        queryFn: () =>
          publicApiClient
            .$route("collection.branches.getAll")
            .$get(branchQuery)
            .then(unpack<Branch[]>),
      }),
    );
  },
  component: OrderPage,
});

function OrderPage() {
  return (
    <Container size={"md"}>
      <Stack gap={"xs"}>
        <Title>Hvor går du på skole?</Title>
        <SelectOrderBranch />
      </Stack>
    </Container>
  );
}
