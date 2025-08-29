"use client";
import { Alert } from "@mantine/core";
import { AuthVippsError } from "backend/shared/auth_vipps_error";
import { useSearchParams } from "next/navigation";

const AUTH_VIPPS_ERROR = {
  ACCESS_DENIED: "access_denied",
  EXPIRED: "expired",
  ERROR: "error",
} as const satisfies Record<Uppercase<AuthVippsError>, AuthVippsError>;

export default function AuthFailureReasonAlert() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") as AuthVippsError | null;

  let text = "";
  switch (reason) {
    case AUTH_VIPPS_ERROR.ACCESS_DENIED: {
      text = "Du har avbrutt innloggingsprosessen";
      break;
    }
    case AUTH_VIPPS_ERROR.EXPIRED: {
      text = "Forespørselen din har utløpt";
      break;
    }
    case AUTH_VIPPS_ERROR.ERROR:
    default: {
      text = "Det skjedde en ukjent feil";
      break;
    }
  }

  return (
    <Alert color={"red"} title={text}>
      Vennligst prøv på nytt eller ta kontakt hvis problemet vedvarer.
    </Alert>
  );
}
