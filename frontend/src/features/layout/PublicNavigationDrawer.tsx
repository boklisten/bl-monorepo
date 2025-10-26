"use client";
import { Burger, Divider, Drawer, NavLink, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBook,
  IconClock,
  IconExternalLink,
  IconHeartHandshake,
  IconInfoCircle,
  IconLogin,
  IconLogout,
  IconMail,
  IconReceipt,
  IconSearch,
  IconShoppingCart,
  IconUserEdit,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "react";

import TasksIndicator from "@/features/layout/TasksIndicator";
import TasksLink from "@/features/layout/TasksLink";
import useAuth from "@/shared/hooks/useAuth";

export default function PublicNavigationDrawer() {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();
  const { isLoggedIn, isEmployee } = useAuth();
  return (
    <>
      <Activity mode={isLoggedIn ? "visible" : "hidden"}>
        <TasksIndicator>
          <Burger color={"white"} opened={opened} onClick={toggle} />
        </TasksIndicator>
      </Activity>
      <Activity mode={!isLoggedIn ? "visible" : "hidden"}>
        <Burger color={"white"} opened={opened} onClick={toggle} />
      </Activity>

      <Drawer
        opened={opened}
        onClose={close}
        position={"right"}
        title={"Velg side"}
      >
        <Stack gap={5}>
          <Activity mode={isLoggedIn ? "visible" : "hidden"}>
            <TasksLink />
          </Activity>
          <NavLink
            label={"Bestill bøker"}
            href={"/bestilling"}
            active={pathname.includes("/bestilling")}
            variant={"subtle"}
            leftSection={<IconShoppingCart />}
            component={Link}
            onClick={close}
          />

          <Activity mode={isLoggedIn ? "visible" : "hidden"}>
            <NavLink
              label={"Dine bøker"}
              href={"/items"}
              active={pathname.includes("/items")}
              variant={"subtle"}
              leftSection={<IconBook />}
              component={Link}
              onClick={close}
            />
            <NavLink
              label={"Ordrehistorikk"}
              href={"/order-history"}
              active={pathname.includes("/order-history")}
              variant={"subtle"}
              leftSection={<IconReceipt />}
              component={Link}
              onClick={close}
            />
            <NavLink
              label={"Overleveringer"}
              href={"/overleveringer"}
              active={pathname.includes("/overleveringer")}
              variant={"subtle"}
              leftSection={<IconHeartHandshake />}
              component={Link}
              onClick={close}
            />
            <NavLink
              label={"Boksøk"}
              description={
                "Søk opp en bok sin unike ID for å finne ut hvem som er ansvarlig for den"
              }
              href={"/sjekk"}
              active={pathname.includes("/sjekk")}
              variant={"subtle"}
              leftSection={<IconSearch />}
              component={Link}
              onClick={close}
            />
          </Activity>
          <Divider label={"Informasjon"} />
          <NavLink
            label={"Generell informasjon"}
            href={"/info/general"}
            active={pathname.includes("/info/general")}
            variant={"subtle"}
            leftSection={<IconInfoCircle />}
            component={Link}
            onClick={close}
          />
          <NavLink
            label={"Åpningstider"}
            href={"/info/branch"}
            active={pathname.includes("/info/branch")}
            variant={"subtle"}
            leftSection={<IconClock />}
            component={Link}
            onClick={close}
          />
          <NavLink
            label={"Kontaktinformasjon"}
            href={"/info/contact"}
            active={pathname.includes("/info/contact")}
            variant={"subtle"}
            leftSection={<IconMail />}
            component={Link}
            onClick={close}
          />

          <Divider label={"Bruker"} />

          <Activity mode={isLoggedIn ? "visible" : "hidden"}>
            <NavLink
              label={"Brukerinnstillinger"}
              href={"/user-settings"}
              active={pathname.includes("/user-settings")}
              variant={"subtle"}
              leftSection={<IconUserEdit />}
              component={Link}
              onClick={close}
            />
            <Activity mode={isEmployee ? "visible" : "hidden"}>
              <NavLink
                label={"Gå til bl-admin"}
                description={
                  "Her kan du søke opp kunder, samle inn og dele ut bøker."
                }
                href={"/admin"}
                leftSection={<IconExternalLink />}
                component={Link}
                active
                color={"orange"}
                onClick={close}
              />
            </Activity>
            <NavLink
              label={"Logg ut"}
              href={"/auth/logout"}
              leftSection={<IconLogout />}
              component={Link}
              active
              variant={"subtle"}
              color={"red"}
              onClick={close}
            />
          </Activity>

          <Activity mode={!isLoggedIn ? "visible" : "hidden"}>
            <NavLink
              label={"Registrer"}
              href={"/auth/register"}
              active={pathname.includes("/auth/register")}
              variant={"subtle"}
              leftSection={<IconUserPlus />}
              onClick={close}
            />
            <NavLink
              label={"Logg inn"}
              href={"/auth/login"}
              active={pathname.includes("/auth/login")}
              variant={"subtle"}
              leftSection={<IconLogin />}
              onClick={close}
            />
          </Activity>
        </Stack>
      </Drawer>
    </>
  );
}
