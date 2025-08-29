"use client";
import {
  Badge,
  Burger,
  Divider,
  Drawer,
  Indicator,
  NavLink,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBook,
  IconClock,
  IconHeartHandshake,
  IconIdBadge,
  IconLogin,
  IconLogout,
  IconMail,
  IconReceipt,
  IconSearch,
  IconShoppingCart,
  IconUserEdit,
  IconUserPlus,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getAccessTokenBody } from "@/api/token";
import useApiClient from "@/utils/api/useApiClient";
import useAuth from "@/utils/useAuth";

export default function PublicNavigationDrawer() {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();
  const { isLoggedIn, isEmployee } = useAuth();
  const client = useApiClient();

  const {
    data: userDetail,
    isLoading: isLoadingUserDetail,
    isError: isErrorUserDetail,
  } = useQuery({
    queryKey: [client.v2.user_details.$url()],
    queryFn: () => {
      const { details } = getAccessTokenBody();
      if (!details) return null;
      return client.v2.user_details({ detailsId: details }).$get().unwrap();
    },
  });

  const taskCount =
    isLoadingUserDetail || isErrorUserDetail || !userDetail?.tasks
      ? 0
      : (userDetail.tasks.confirmDetails ? 1 : 0) +
        (userDetail.tasks.signAgreement ? 1 : 0);
  return (
    <>
      <Indicator color={"red"} disabled={taskCount === 0}>
        <Burger color={"white"} opened={opened} onClick={toggle} />
      </Indicator>
      <Drawer
        opened={opened}
        onClose={close}
        onClick={close}
        position={"right"}
        title={"Velg side"}
      >
        <Stack gap={5}>
          {taskCount > 0 && (
            <NavLink
              label={"Oppgaver"}
              description={`Du har ${taskCount} ${taskCount === 1 ? "oppgave" : "oppgaver"} som må fullføres.`}
              href={"/oppgaver"}
              leftSection={
                <Badge color={"red"} circle>
                  {taskCount}
                </Badge>
              }
              component={Link}
              color={"red"}
              active
              variant={"subtle"}
            />
          )}

          <NavLink
            label={"Bestill bøker"}
            href={"/order"}
            active={pathname.includes("/order")}
            variant={"subtle"}
            leftSection={<IconShoppingCart />}
            component={Link}
          />

          {isLoggedIn && (
            <>
              <NavLink
                label={"Dine bøker"}
                href={"/items"}
                active={pathname.includes("/items")}
                variant={"subtle"}
                leftSection={<IconBook />}
                component={Link}
              />
              <NavLink
                label={"Ordrehistorikk"}
                href={"/order-history"}
                active={pathname.includes("/order-history")}
                variant={"subtle"}
                leftSection={<IconReceipt />}
                component={Link}
              />
              <NavLink
                label={"Overleveringer"}
                href={"/overleveringer"}
                active={pathname.includes("/overleveringer")}
                variant={"subtle"}
                leftSection={<IconHeartHandshake />}
                component={Link}
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
              />
            </>
          )}
          <Divider label={"Informasjon"} />

          <NavLink
            label={"Åpningstider"}
            href={"/info/branch"}
            active={pathname.includes("/info/branch")}
            variant={"subtle"}
            leftSection={<IconClock />}
            component={Link}
          />
          <NavLink
            label={"Kontaktinformasjon"}
            href={"/info/contact"}
            active={pathname.includes("/info/contact")}
            variant={"subtle"}
            leftSection={<IconMail />}
            component={Link}
          />

          <Divider label={"Bruker"} />

          {isLoggedIn && (
            <>
              <NavLink
                label={"Brukerinnstillinger"}
                href={"/user-settings"}
                active={pathname.includes("/user-settings")}
                variant={"subtle"}
                leftSection={<IconUserEdit />}
                component={Link}
              />
              {isEmployee && (
                <NavLink
                  label={"Ansattområde"}
                  description={
                    "Her kan du søke opp kunder, samle inn og dele ut bøker."
                  }
                  href={"/admin"}
                  leftSection={<IconIdBadge />}
                  component={Link}
                  active
                  color={"indigo"}
                />
              )}
              <NavLink
                label={"Logg ut"}
                href={"/auth/logout"}
                leftSection={<IconLogout />}
                component={Link}
                active
                variant={"subtle"}
                color={"red"}
              />
            </>
          )}

          {!isLoggedIn && (
            <>
              <NavLink
                label={"Registrer"}
                href={"/auth/register"}
                active={pathname.includes("/auth/register")}
                variant={"subtle"}
                leftSection={<IconUserPlus />}
              />
              <NavLink
                label={"Logg inn"}
                href={"/auth/login"}
                active={pathname.includes("/auth/login")}
                variant={"subtle"}
                leftSection={<IconLogin />}
              />
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
