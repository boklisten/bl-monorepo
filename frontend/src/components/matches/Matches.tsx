"use client";
import { Alert } from "@mui/material";
import Button from "@mui/material/Button";

import { isLoggedIn } from "@/api/auth";
import DynamicLink from "@/components/DynamicLink";
import { MatchesList } from "@/components/matches/matchesList/MatchesList";
import useIsHydrated from "@/utils/useIsHydrated";

export default function Matches() {
  const hydrated = useIsHydrated();

  return (
    hydrated &&
    (isLoggedIn() ? (
      <MatchesList />
    ) : (
      <>
        <Alert severity="info">
          Du må logge inn for å se overleveringene dine
        </Alert>
        <DynamicLink href={"/auth/login?redirect=matches"}>
          <Button variant={"contained"} sx={{ mt: 2 }}>
            Logg inn
          </Button>
        </DynamicLink>
      </>
    ))
  );
}
