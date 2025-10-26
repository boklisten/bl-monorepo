"use client";
import { Button } from "@mantine/core";
import Link from "next/link";
import { Activity } from "react";

import useAuth from "@/shared/hooks/useAuth";

export default function EndButtons() {
  const { isLoggedIn } = useAuth();
  return (
    <>
      <Activity mode={isLoggedIn ? "visible" : "hidden"}>
        <Button component={Link} href={"/bestilling"} variant={"outline"}>
          Bestill bøker
        </Button>
        <Button component={Link} href={"/items"} variant={"outline"}>
          Se mine bøker
        </Button>
      </Activity>
      <Activity mode={!isLoggedIn ? "visible" : "hidden"}>
        <Button component={Link} href={"/auth/register"}>
          Registrer deg
        </Button>
        <Button
          variant={"outline"}
          component={Link}
          href={"/auth/login"}
          c={"green"}
        >
          Logg inn
        </Button>
      </Activity>
    </>
  );
}
