import { Branch } from "@boklisten/backend/shared/branch";
import { Item } from "@boklisten/backend/shared/item";
import { WaitingListEntry } from "@boklisten/backend/shared/waiting-list-entry";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import useApiClient from "@/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function WaitingListTable({
  loading,
  items,
  branches,
  waitingList,
}: {
  loading: boolean;
  items: Item[];
  branches: Branch[];
  waitingList: WaitingListEntry[];
}) {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const destroyWaitingListEntryMutation = useMutation({
    mutationFn: (id: string) =>
      client.waiting_list_entries({ id }).$delete().unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.waiting_list_entries.$url()],
      }),
    onSuccess: () =>
      showSuccessNotification("Ventelisteoppføring ble slettet!"),
    onError: async () =>
      showErrorNotification("Klarte ikke slette ventelisteoppføring!"),
  });

  const columns: GridColDef[] = [
    {
      field: "customerName",
      headerName: "Navn",
      width: 200,
    },
    {
      field: "customerPhone",
      headerName: "Telefonnummer",
      width: 150,
    },
    {
      field: "itemId",
      headerName: "Bok",
      width: 200,
      type: "singleSelect",
      valueOptions: items.map((item) => ({
        label: item.title,
        value: item.id,
      })),
    },
    {
      field: "branchId",
      headerName: "Filial",
      width: 150,
      type: "singleSelect",
      valueOptions: branches.map((branch) => ({
        label: branch.name,
        value: branch.id,
      })),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Handlinger",
      width: 100,
      getActions: ({ id }) => {
        return [
          <Tooltip key={`delete-${id}`} title={"Slett"}>
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() =>
                destroyWaitingListEntryMutation.mutate(id as string)
              }
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];

  return (
    <DataGrid
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5,
          },
        },
      }}
      pageSizeOptions={[5, 10, 100]}
      rows={waitingList}
      loading={loading || destroyWaitingListEntryMutation.isPending}
      columns={columns}
      checkboxSelection
      disableRowSelectionOnClick
      sx={{ border: 0 }}
    />
  );
}
