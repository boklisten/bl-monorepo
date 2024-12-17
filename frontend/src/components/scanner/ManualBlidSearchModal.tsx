import { Close, InputRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const ManualBlidSearchModal = ({
  open,
  handleClose,
  handleSubmit,
}: {
  open: boolean;
  handleClose: () => void;

  handleSubmit: (scannedText: string) => void;
}) => {
  const [manualInput, setManualInput] = useState("");
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <Stack>
          <Typography variant="h4">Manuell registrering</Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            Skal kun brukes dersom bokas unike ID ikke lar seg skanne
          </Alert>
          <InputLabel sx={{ mt: 2, mb: 0.8 }}>
            Skriv inn bokas unike ID
          </InputLabel>
          <TextField
            value={manualInput}
            label="8 siffer eller 12 bokstaver"
            sx={{ marginBottom: 2 }}
            onChange={(event) => setManualInput(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          color={"info"}
          variant="outlined"
          startIcon={<Close />}
          onClick={() => {
            setManualInput("");
            handleClose();
          }}
        >
          Lukk
        </Button>
        <Button
          startIcon={<InputRounded />}
          color={"success"}
          variant={"outlined"}
          onClick={() => {
            handleSubmit(manualInput);
          }}
        >
          Bekreft
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManualBlidSearchModal;
