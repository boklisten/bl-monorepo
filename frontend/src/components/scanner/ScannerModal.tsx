import { Close, InputRounded } from "@mui/icons-material";
import { AlertColor, Box, Button, Card, Modal, Stack } from "@mui/material";
import { ReactNode, useState } from "react";

import BlidScanner, {
  determineScannedTextType,
} from "@/components/scanner/BlidScanner";
import ManualBlidSearchModal from "@/components/scanner/ManualBlidSearchModal";
import ScannerFeedback from "@/components/scanner/ScannerFeedback";
import { assertBlApiError, TextType } from "@/utils/types";

interface Feedback {
  text: string;
  severity: AlertColor;
  visible: boolean;
}

const ScannerModal = ({
  onScan,
  open,
  handleClose,
  handleSuccessfulScan,
  allowManualRegistration,
  children,
}: {
  onScan: (blid: string) => Promise<[{ feedback: string }]>;
  open: boolean;
  handleClose: () => void;
  handleSuccessfulScan?: (() => void) | undefined;
  allowManualRegistration?: boolean;
  children?: ReactNode;
}) => {
  const [manualRegistrationModalOpen, setManualRegistrationModalOpen] =
    useState(false);

  const [feedback, setFeedback] = useState<Feedback>({
    text: "",
    severity: "success",
    visible: false,
  });

  const handleRegistration = async (scannedText: string) => {
    const scannedTextType = determineScannedTextType(scannedText);
    if (scannedTextType === TextType.ISBN) {
      setFeedback({
        text: "Feil strekkode. Bruk bokas unike ID. Se instruksjoner for hjelp",
        severity: "error",
        visible: true,
      });
      return;
    }
    if (scannedTextType === TextType.UNKNOWN) {
      setFeedback({
        text: "Ugyldig strekkode. Vennligst prøv igjen, eller ta kontakt med stand for hjelp",
        severity: "error",
        visible: true,
      });
      return;
    }

    try {
      const [{ feedback }] = await onScan(scannedText);
      try {
        navigator?.vibrate(100);
      } catch {
        // Some browsers or devices may not have implemented the vibrate function
      }
      setFeedback({
        text: feedback ?? "Boken har blitt registrert!",
        severity: feedback ? "info" : "success",
        visible: true,
      });
      handleSuccessfulScan?.();
    } catch (error) {
      if (assertBlApiError(error) && error.msg) {
        setFeedback({
          text: error.msg,
          severity: "error",
          visible: true,
        });
      }
    }
  };

  return (
    <Modal
      open={open}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Card
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          flexBasis: "30rem",
          maxWidth: "50rem",
          maxHeight: "calc(var(--vh, 1vh) * 100)",
          paddingBottom: 2,
          borderRadius: 0,
          overflowY: "hidden",
        }}
      >
        <Box
          sx={{
            maxWidth: "30rem",
            maxHeight: "100%",
            flexBasis: 1.2,
            flexShrink: 0,
          }}
        >
          <BlidScanner onResult={handleRegistration} />
        </Box>
        {children}
        <Stack
          direction={"row"}
          sx={{
            gap: 1,
            mt: 2,
          }}
        >
          {allowManualRegistration && (
            <Button
              color={"info"}
              variant={"outlined"}
              startIcon={<InputRounded />}
              onClick={() => setManualRegistrationModalOpen(true)}
            >
              Skriv inn blid manuelt
            </Button>
          )}
          <Button
            color={"info"}
            startIcon={<Close />}
            variant={"contained"}
            onClick={handleClose}
          >
            Lukk
          </Button>
        </Stack>
        <ManualBlidSearchModal
          open={manualRegistrationModalOpen}
          handleClose={() => {
            setManualRegistrationModalOpen(false);
          }}
          handleSubmit={(scannedText) => {
            setManualRegistrationModalOpen(false);
            handleRegistration(scannedText);
          }}
        />
        <ScannerFeedback
          open={feedback.visible}
          severity={feedback.severity}
          feedback={feedback.text}
          handleClose={() =>
            setFeedback((previous) => ({ ...previous, visible: false }))
          }
        />
      </Card>
    </Modal>
  );
};

export default ScannerModal;
