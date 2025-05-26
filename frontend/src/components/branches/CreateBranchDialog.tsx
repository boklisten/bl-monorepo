import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";

import BranchSettings from "@/components/branches/BranchSettings";

export default function CreateBranchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Opprett filial</DialogTitle>
      <DialogContent>
        <Box sx={{ width: 1000 }} />
        <BranchSettings branch={null} />
      </DialogContent>
      <DialogActions>
        <Button>Avbryt</Button>
        <Button>Opprett</Button>
      </DialogActions>
    </Dialog>
  );
}
