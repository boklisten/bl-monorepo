import { Branch } from "@boklisten/backend/shared/branch/branch";
import { Item } from "@boklisten/backend/shared/item/item";
import { WaitingListEntry } from "@boklisten/backend/shared/waiting-list/waiting-list-entry";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import blFetcher from "@/api/blFetcher";
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
  const { client } = useApiClient();
  const queryClient = useQueryClient();
  const [pendingUpdate, setPendingUpdate] = useState(false);
  async function handleDeleteWaitingListEntry(id: string | number) {
    setPendingUpdate(true);
    await blFetcher.destroy(
      client.$url("waiting_list_entries.delete", { params: { id } }),
    );
    await queryClient.invalidateQueries({
      queryKey: [client.waiting_list_entries.$url()],
    });
    setPendingUpdate(false);
  }

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
              onClick={() => handleDeleteWaitingListEntry(id)}
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
      loading={loading || pendingUpdate}
      columns={columns}
      checkboxSelection
      disableRowSelectionOnClick
      slots={{ toolbar: GridToolbar }}
      sx={{ border: 0 }}
    />
  );
}
