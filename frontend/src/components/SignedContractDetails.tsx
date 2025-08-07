import { Alert, AlertTitle, Stack, Typography } from "@mui/material";

export default function SignedContractDetails({
  signedByGuardian,
  signingName,
  name,
  signedAtText,
  expiresAtText,
}: {
  signedByGuardian: boolean;
  signingName: string;
  name: string;
  signedAtText: string;
  expiresAtText: string;
}) {
  return (
    <Alert>
      <AlertTitle>Kontrakten er signert</AlertTitle>
      <Stack gap={1}>
        <Typography variant={"body2"}>
          {signedByGuardian
            ? `${signingName} (foresatt) har signert kontrakten på vegne av ${name} (elev).`
            : `${name} (elev) har signert kontrakten.`}
        </Typography>
        <Stack direction={"row"} gap={1}>
          <Typography variant={"body2"}>Signert:</Typography>
          <Typography variant={"body2"} fontWeight={"bold"}>
            {signedAtText}
          </Typography>
        </Stack>
        <Stack direction={"row"} gap={1}>
          <Typography variant={"body2"}>Gyldig til:</Typography>
          <Typography variant={"body2"} fontWeight={"bold"}>
            {expiresAtText}
          </Typography>
        </Stack>
      </Stack>
    </Alert>
  );
}
