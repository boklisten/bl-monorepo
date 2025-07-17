"use client";
import {
  AUTH_SOCIAL_ERROR,
  AuthSocialError,
} from "@boklisten/backend/shared/auth_social/auth_social_error";
import { Alert, AlertTitle } from "@mui/material";
import { useSearchParams } from "next/navigation";

export default function AuthFailureReasonAlert() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") as AuthSocialError | null;

  let text = "";
  let description: string | null = null;
  switch (reason) {
    case AUTH_SOCIAL_ERROR.ACCESS_DENIED: {
      text = "Du har avbytt innloggingsprosessen";
      break;
    }
    case AUTH_SOCIAL_ERROR.EXPIRED: {
      text = "Forespørselen din har utløpt";
      break;
    }
    case AUTH_SOCIAL_ERROR.NO_EMAIL: {
      text = "Din Facebook-konto har ingen e-postadresse";
      description =
        "Hvis du vil logge inn med Facebook, må du først legge til en e-post i kontoinnstillingene på din Facebook-profil.";
      break;
    }
    case AUTH_SOCIAL_ERROR.ERROR:
    default: {
      text = "Det skjedde en ukjent feil";
      break;
    }
  }

  return (
    <Alert severity={"error"} sx={{ my: 2 }}>
      <AlertTitle>{text}</AlertTitle>
      {description ??
        "Vennligst prøv på nytt eller ta kontakt hvis problemet vedvarer."}
    </Alert>
  );
}
