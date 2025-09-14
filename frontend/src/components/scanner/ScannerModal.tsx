import { Button, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconForms } from "@tabler/icons-react";
import { PropsWithChildren } from "react";

import BlidScanner, {
  determineScannedTextType,
} from "@/components/scanner/BlidScanner";
import ManualBlidSearchModal from "@/components/scanner/ManualBlidSearchModal";
import { GENERIC_ERROR_TEXT } from "@/utils/constants";
import {
  showErrorNotification,
  showInfoNotification,
  showSuccessNotification,
} from "@/utils/notifications";
import { TextType } from "@/utils/types";

const ScannerModal = ({
  onScan,
  onSuccessfulScan,
  allowManualRegistration,
  disableValidation,
  children,
}: PropsWithChildren<{
  onScan: (blid: string) => Promise<[{ feedback: string }]>;
  onSuccessfulScan?: (() => void) | undefined;
  allowManualRegistration?: boolean;
  disableValidation?: boolean;
}>) => {
  const handleRegistration = async (scannedText: string) => {
    const scannedTextType = determineScannedTextType(scannedText);
    if (!disableValidation && scannedTextType === TextType.ISBN) {
      showErrorNotification({
        title: "Feil strekkode",
        message: "Bruk bokas unike ID. Se instruksjoner for hjelp.",
      });
      return;
    }
    if (!disableValidation && scannedTextType === TextType.UNKNOWN) {
      showErrorNotification({
        title: "Ugyldig strekkode",
        message: "Vennligst prøv igjen, eller ta kontakt med stand for hjelp.",
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
      if (feedback) {
        showInfoNotification({
          title: "Viktig informasjon",
          message: feedback,
          color: "yellow",
        });
      } else if (!disableValidation) {
        showSuccessNotification("Boken har blitt registrert!");
      }
      onSuccessfulScan?.();
    } catch {
      showErrorNotification(GENERIC_ERROR_TEXT);
    }
  };

  return (
    <Stack>
      <BlidScanner onResult={handleRegistration} />
      {children}
      {allowManualRegistration && (
        <Button
          variant={"outline"}
          leftSection={<IconForms />}
          onClick={() =>
            modals.open({
              title: "Manuell registrering",
              children: <ManualBlidSearchModal onSubmit={handleRegistration} />,
            })
          }
        >
          Skriv inn blid manuelt
        </Button>
      )}
    </Stack>
  );
};

export default ScannerModal;
