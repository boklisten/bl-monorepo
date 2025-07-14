import { Tooltip } from "@mui/material";
import Chip from "@mui/material/Chip";

const capitalize = (s: string) =>
  s.length > 0 && s[0]?.toUpperCase() + s.slice(1);

export default function TestVersionChip() {
  const env = process.env["NEXT_PUBLIC_APP_ENV"];
  if (!env || env === "production") return;
  return (
    <Tooltip
      title={
        "Dette er en test-versjon av Boklisten.no, koblet til en test-database, som tilbakestilles hver natt. Endringer og ordre er derfor IKKE permanente her."
      }
    >
      <Chip
        sx={{ mt: 0.25, ml: 1, fontWeight: "bold" }}
        size={"medium"}
        color={"warning"}
        label={capitalize(env)}
      />
    </Tooltip>
  );
}
