import { BranchItem } from "@boklisten/backend/shared/branch-item/branch-item";
import { Item } from "@boklisten/backend/shared/item/item";
import {
  Switch,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";

import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";
import {
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "@/utils/notifications";

type BranchItemWithRealItem = Omit<BranchItem, "item"> & { item: Item };

export default function BranchSettingsSubjects({
  branchId,
}: {
  branchId: string;
}) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const branchItemsQuery = {
    query: { branch: branchId, expand: "item" },
  };
  const { data: branchItems } = useQuery({
    queryKey: [client.$url("collection.branchitems.getAll", branchItemsQuery)],
    queryFn: () =>
      client
        .$route("collection.branchitems.getAll")
        .$get(branchItemsQuery)
        .then(unpack<BranchItemWithRealItem[]>),
  });

  const updateRequiredSubject = useMutation({
    mutationFn: ({
      branchItemId,
      required,
    }: {
      branchItemId: string;
      required: boolean;
    }) => {
      return client
        .$route("collection.branchitems.patch", { id: branchItemId })
        .$patch({ required });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          client.$url("collection.branchitems.getAll", branchItemsQuery),
        ],
      });
    },
    onSuccess: async () => {
      notifications.show("Innstilling ble oppdatert!", SUCCESS_NOTIFICATION);
    },
    onError: async () => {
      notifications.show(
        "Klarte ikke oppdatere innstilling!",
        ERROR_NOTIFICATION,
      );
    },
  });

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bok</TableCell>
            <TableCell>Fag</TableCell>
            <TableCell>Fellesfag?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {branchItems?.map((branchItem) => (
            <TableRow key={branchItem.id}>
              <TableCell>{branchItem.item.title}</TableCell>
              <TableCell>{branchItem.categories?.join(", ")}</TableCell>
              <TableCell>
                <Switch
                  checked={branchItem.required ?? false}
                  onChange={(_, checked) =>
                    updateRequiredSubject.mutate({
                      branchItemId: branchItem.id,
                      required: checked,
                    })
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
