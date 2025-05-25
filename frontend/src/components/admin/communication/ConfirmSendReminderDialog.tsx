import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function ConfirmSendReminderDialog({
  recipientCount,
  messageMethod,
  open,
  onAbort,
  onConfirm,
}: {
  recipientCount: number;
  messageMethod: "sms" | "email";
  open: boolean;
  onAbort: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onAbort}>
      <DialogTitle>Bekreft utsendelse av påminnelse</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Du er nå i ferd med å sende en påminnelse på{" "}
          {messageMethod === "sms" ? "sms" : "e-post"} til {recipientCount}{" "}
          kunder.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onAbort}>Avbryt</Button>
        <Button onClick={onConfirm}>Send</Button>
      </DialogActions>
    </Dialog>
  );
}
