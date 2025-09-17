import { Table, Tooltip } from "@mantine/core";
import {
  IconAlertSquareFilled,
  IconSquareCheckFilled,
} from "@tabler/icons-react";

import { ItemStatus } from "@/shared/components/matches/matches-helper";

const MatchItemTable = ({
  itemFilter = null,
  itemStatuses,
  isSender,
}: {
  itemFilter?: string[] | null;
  itemStatuses: ItemStatus[];
  isSender: boolean;
}) => {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Tittel</Table.Th>
          <Table.Th>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {itemStatuses
          .filter((is) => itemFilter === null || itemFilter.includes(is.id))
          .sort((a, b) => Number(a.fulfilled) - Number(b.fulfilled))
          .map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>{item.title}</Table.Td>
              <Tooltip
                label={
                  (item.fulfilled
                    ? "Denne boken er registrert som "
                    : "Denne boken har ikke blitt registrert som ") +
                  (isSender ? "levert" : "mottatt")
                }
              >
                <Table.Td>
                  {item.fulfilled ? (
                    <IconSquareCheckFilled color={"green"} />
                  ) : (
                    <IconAlertSquareFilled color={"orange"} />
                  )}
                </Table.Td>
              </Tooltip>
            </Table.Tr>
          ))}
      </Table.Tbody>
    </Table>
  );
};

export default MatchItemTable;
