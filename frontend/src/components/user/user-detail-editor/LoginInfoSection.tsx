import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Button, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import Grid from "@mui/material/Grid";
import { IconQrcode } from "@tabler/icons-react";
import { useFormContext, useWatch } from "react-hook-form";
import QRCode from "react-qr-code";

import WarningAlert from "@/components/ui/alerts/WarningAlert";
import EmailConfirmationStatus from "@/components/user/fields/EmailConfirmationStatus";
import EmailField from "@/components/user/fields/EmailField";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import PasswordField from "@/components/user/fields/PasswordField";
import {
  UserDetailsEditorVariant,
  UserEditorFields,
} from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function LoginInfoSection({
  variant,
  userDetails,
}: {
  variant: UserDetailsEditorVariant;
  userDetails: UserDetail;
}) {
  const { control } = useFormContext<UserEditorFields>();
  const email = useWatch({ control, name: "email" });
  const isSchoolEmail =
    email &&
    [
      "osloskolen.no",
      "sonans.no",
      "wangelev.no",
      "edu.nki.no",
      "stud.akademiet.no",
      "elev.ottotreider.no",
    ].some((domain) => email.includes(domain));

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <Stack>
          {variant === "signup" && isSchoolEmail && (
            <WarningAlert>
              Vi anbefaler at du bruker din personlige e-postadresse i stedet
              for skolekontoen. Da beholder du tilgangen etter endt utdanning og
              kan motta viktige varsler om eventuelle manglende
              bokinnleveringer.
            </WarningAlert>
          )}
          <EmailField
            disabled={variant === "personal"}
            helperText={
              variant === "personal"
                ? "Ta kontakt dersom du ønsker å endre e-postadresse"
                : ""
            }
          />
          <EmailConfirmationStatus
            userDetails={userDetails}
            variant={variant}
          />
          <FieldErrorAlert field={"email"} />
        </Stack>
      </Grid>
      {variant === "personal" && (
        <Stack align={"center"} w={"100%"}>
          <Button
            leftSection={<IconQrcode />}
            onClick={() =>
              modals.open({
                title: `Kunde-ID for ${userDetails.name}`,
                children: (
                  <Stack align={"center"} w={"100%"}>
                    <QRCode value={userDetails.id} />
                  </Stack>
                ),
              })
            }
          >
            Vis kunde-ID
          </Button>
        </Stack>
      )}
      {variant === "signup" && (
        <Grid size={{ xs: 12 }}>
          <PasswordField label={"Passord"} autoComplete="new-password" />
          <FieldErrorAlert field={"password"} />
        </Grid>
      )}
    </>
  );
}
