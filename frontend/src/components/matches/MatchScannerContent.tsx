import { ItemStatus } from "@frontend/components/matches/matches-helper";
import ProgressBar from "@frontend/components/matches/matchesList/ProgressBar";
import MatchItemTable from "@frontend/components/matches/MatchItemTable";
import { Box, Typography } from "@mui/material";
import { useEffect } from "react";

export default function MatchScannerContent({
  expectedItems,
  fulfilledItems,
  itemStatuses,
  scannerOpen,
  handleClose,
}: {
  itemStatuses: ItemStatus[];
  expectedItems: string[];
  fulfilledItems: string[];
  scannerOpen: boolean;
  handleClose: () => void;
}) {
  useEffect(() => {
    if (scannerOpen && expectedItems.length === fulfilledItems.length) {
      handleClose();
    }
  }, [expectedItems.length, fulfilledItems.length, handleClose, scannerOpen]);
  return (
    <>
      <Box
        sx={{
          width: 0.9,
        }}
      >
        <ProgressBar
          percentComplete={(fulfilledItems.length * 100) / expectedItems.length}
          subtitle={
            <Typography
              sx={{
                textAlign: "center",
              }}
            >
              {fulfilledItems.length} av {expectedItems.length} bøker mottatt
            </Typography>
          }
        />
      </Box>
      <Box
        sx={{
          overflowY: "auto",
          maxHeight: "30rem",
          mt: 2,
        }}
      >
        <MatchItemTable itemStatuses={itemStatuses} isSender={false} />
      </Box>
    </>
  );
}
