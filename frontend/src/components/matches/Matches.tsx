"use client";

import { isLoggedIn } from "@frontend/api/auth";
import DynamicLink from "@frontend/components/DynamicLink";
import { MatchesList } from "@frontend/components/matches/matchesList/MatchesList";
import useIsHydrated from "@frontend/utils/useIsHydrated";
import { Alert } from "@mui/material";
import Button from "@mui/material/Button";

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
