"use client";
import { Button, Group } from "@mantine/core";
import { IconBook } from "@tabler/icons-react";
import Link from "next/link";
import { Activity } from "react";

import useAuth from "@/shared/hooks/useAuth";

export default function QuickButtons() {
  const { isLoggedIn } = useAuth();
  return (
    <Group justify={"center"}>
      <Activity mode={isLoggedIn ? "visible" : "hidden"}>
        <Button component={Link} href={"/items"} leftSection={<IconBook />}>
          Dine bøker
        </Button>
      </Activity>
      <Activity mode={!isLoggedIn ? "visible" : "hidden"}>
        <Button component={Link} href={"/auth/login"} bg={"green"}>
          Logg inn
        </Button>
        <Button component={Link} href={"/auth/register"}>
          Registrer deg
        </Button>
      </Activity>
      <Button component={Link} href={"/info/branch"} variant={"outline"}>
        Våre åpningstider
      </Button>
      <Button component={Link} href={"/info/faq"} variant={"outline"}>
        Ofte stilte spørsmål
      </Button>
    </Group>
  );
}
