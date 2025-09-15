import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Button, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconQrcode } from "@tabler/icons-react";
import QRCode from "react-qr-code";

import EmailConfirmationStatus from "@/components/user/fields/EmailConfirmationStatus";
import EmailField from "@/components/user/fields/EmailField";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import { UserDetailsEditorVariant } from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function LoginInfoSection({
  variant,
  userDetails,
}: {
  variant: UserDetailsEditorVariant;
  userDetails: UserDetail;
}) {
  return (
    <>
      <EmailField
        disabled={variant === "personal"}
        helperText={
          variant === "personal"
            ? "Ta kontakt dersom du ønsker å endre e-postadresse"
            : ""
        }
      />
      <EmailConfirmationStatus userDetails={userDetails} variant={variant} />
      <FieldErrorAlert field={"email"} />
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
    </>
  );
}
