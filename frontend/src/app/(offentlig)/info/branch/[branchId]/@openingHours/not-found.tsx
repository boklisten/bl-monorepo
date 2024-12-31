import ContactInfo from "@frontend/components/info/ContactInfo";
import { Alert } from "@mui/material";

export default function OpeningHoursNotFound() {
  return (
    <>
      <Alert severity="info" data-testid="noHours" sx={{ my: 4 }}>
        Sesongen er over – eller åpningstidene er ikke klare enda. Du kan
        bestille bøker i Posten, eller kontakte oss for spørsmål.
      </Alert>
      <ContactInfo />
    </>
  );
}
