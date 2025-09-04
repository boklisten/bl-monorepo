"use client";
import { Divider, NavLink, ScrollArea, Stack } from "@mantine/core";
import {
  IconBarcode,
  IconBell,
  IconBooks,
  IconBuildings,
  IconBuildingStore,
  IconChartBar,
  IconChecklist,
  IconDatabase,
  IconEdit,
  IconExternalLink,
  IconFileDollar,
  IconHourglassLow,
  IconLogout,
  IconQrcode,
  IconReceipt,
  IconSearch,
  IconShoppingCart,
  IconUserEdit,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import useAuth from "@/hooks/useAuth";

export default function AdminPageNavigation({
  onNavigate = () => {
    return;
  },
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  return (
    <Stack justify={"space-between"} h={"100%"}>
      <ScrollArea>
        <Stack gap={5}>
          <NavLink
            label={"BL-ID-søk"}
            href={"/admin/blid"}
            active={pathname === "/admin/blid"}
            leftSection={<IconSearch />}
            variant={"subtle"}
            component={Link}
            onClick={onNavigate}
          />
          <NavLink
            label={"Handlekurv"}
            href={"/admin/handlekurv"}
            active={pathname === "/admin/handlekurv"}
            leftSection={<IconShoppingCart />}
            variant={"subtle"}
            component={Link}
            onClick={onNavigate}
          />
          <NavLink
            label={"Hurtiginnsamling"}
            href={"/admin/hurtiginnsamling"}
            active={pathname === "/admin/hurtiginnsamling"}
            leftSection={<IconQrcode />}
            variant={"subtle"}
            component={Link}
            onClick={onNavigate}
          />
          <NavLink
            label={"Hurtigutdeling"}
            href={"/admin/hurtigutdeling"}
            active={pathname === "/admin/hurtigutdeling"}
            leftSection={<IconChecklist />}
            variant={"subtle"}
            component={Link}
            onClick={onNavigate}
          />
          <NavLink
            label={"Ordreoversikt"}
            href={"/admin/ordreoversikt"}
            active={pathname === "/admin/ordreoversikt"}
            leftSection={<IconReceipt />}
            variant={"subtle"}
            component={Link}
            onClick={onNavigate}
          />
          <NavLink
            label={"Venteliste"}
            href={"/admin/venteliste"}
            active={pathname === "/admin/venteliste"}
            leftSection={<IconHourglassLow />}
            variant={"subtle"}
            component={Link}
            onClick={onNavigate}
          />
          <NavLink
            label={"Scanner"}
            href={"/admin/scanner"}
            active={pathname === "/admin/scanner"}
            leftSection={<IconBarcode />}
            variant={"subtle"}
            component={Link}
            onClick={onNavigate}
          />
          {isAdmin && (
            <>
              <Divider label={"Admin"} />
              <NavLink
                label={"Faktura"}
                href={"/admin/faktura"}
                active={pathname === "/admin/faktura"}
                leftSection={<IconFileDollar />}
                variant={"subtle"}
                component={Link}
                onClick={onNavigate}
              />
              <NavLink
                label={"Påminnelser"}
                href={"/admin/kommunikasjon/paminnelser"}
                active={pathname === "/admin/kommunikasjon/paminnelser"}
                leftSection={<IconBell />}
                variant={"subtle"}
                component={Link}
                onClick={onNavigate}
              />
              <NavLink
                label={"Databaseverktøy"}
                leftSection={<IconDatabase />}
                active={pathname.includes("database")}
                variant={"subtle"}
              >
                <NavLink
                  label={"Rapporter"}
                  href={"/admin/database/rapporter"}
                  active={pathname === "/admin/database/rapporter"}
                  leftSection={<IconChartBar />}
                  variant={"subtle"}
                  component={Link}
                  onClick={onNavigate}
                />
                <NavLink
                  label={"Bøker"}
                  href={"/admin/database/boker"}
                  active={pathname === "/admin/database/boker"}
                  leftSection={<IconBooks />}
                  variant={"subtle"}
                  component={Link}
                  onClick={onNavigate}
                />
                <NavLink
                  label={"Filialer"}
                  href={"/admin/database/filialer"}
                  active={pathname === "/admin/database/filialer"}
                  leftSection={<IconBuildingStore />}
                  variant={"subtle"}
                  component={Link}
                  onClick={onNavigate}
                />
                <NavLink
                  label={"Selskap"}
                  href={"/admin/database/selskap"}
                  active={pathname === "/admin/database/selskap"}
                  leftSection={<IconBuildings />}
                  variant={"subtle"}
                  component={Link}
                  onClick={onNavigate}
                />
                <NavLink
                  label={"Dynamisk innhold"}
                  href={"/admin/database/dynamisk_innhold"}
                  active={pathname === "/admin/database/dynamisk_innhold"}
                  leftSection={<IconEdit />}
                  variant={"subtle"}
                  component={Link}
                  onClick={onNavigate}
                />
                <NavLink
                  label={"Unike IDer"}
                  href={"/admin/database/unik_id"}
                  active={pathname === "/admin/database/unik_id"}
                  leftSection={<IconQrcode />}
                  variant={"subtle"}
                  component={Link}
                  onClick={onNavigate}
                />
                <NavLink
                  label={"Lag brukere"}
                  href={"/admin/database/lag_brukere"}
                  active={pathname === "/admin/database/lag_brukere"}
                  leftSection={<IconUserPlus />}
                  variant={"subtle"}
                  component={Link}
                  onClick={onNavigate}
                />
              </NavLink>
            </>
          )}
        </Stack>
      </ScrollArea>

      <Stack gap={5} mb={"md"}>
        <Divider label={"Bruker"} />
        <NavLink
          label={"Brukerinnstillinger"}
          href={"/admin/user-settings"}
          active={pathname.includes("/user-settings")}
          leftSection={<IconUserEdit />}
          variant={"subtle"}
          component={Link}
          onClick={onNavigate}
        />
        <NavLink
          label={"Gå til kundeside"}
          description={"Se offentlig informasjon og egne bøker"}
          href={"/"}
          leftSection={<IconExternalLink />}
          component={Link}
          active
          onClick={onNavigate}
        />
        <NavLink
          label={"Logg ut"}
          href={"/auth/logout"}
          leftSection={<IconLogout />}
          variant={"subtle"}
          component={Link}
          active
          color={"red"}
          onClick={onNavigate}
        />
      </Stack>
    </Stack>
  );
}
