import { Stack } from "@mantine/core";

export default function BranchPageLayout({
  children,
  location,
  openingHours,
}: LayoutProps<"/info/branch/[branchId]">) {
  return (
    <Stack align={"center"} gap={"xl"}>
      {children}
      {location}
      {openingHours}
    </Stack>
  );
}
