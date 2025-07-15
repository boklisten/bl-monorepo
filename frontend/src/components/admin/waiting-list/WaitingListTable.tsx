import { Branch } from "@boklisten/backend/shared/branch/branch";
import { Item } from "@boklisten/backend/shared/item/item";
import { WaitingListEntry } from "@boklisten/backend/shared/waiting-list/waiting-list-entry";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";

import useApiClient from "@/utils/api/useApiClient";

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
  const notifications = useNotifications();

  const destroyWaitingListEntryMutation = useMutation({
    mutationFn: (id: string) =>
      client.waiting_list_entries({ id }).$delete().unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.waiting_list_entries.$url()],
      }),
    onSuccess: () =>
      notifications.show("Ventelisteoppføring ble slettet!", {
        severity: "success",
        autoHideDuration: 3000,
      }),
    onError: async () =>
      notifications.show("Klarte ikke slette ventelisteoppføring!", {
        severity: "error",
        autoHideDuration: 5000,
      }),
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
