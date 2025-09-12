import { Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AdminCart from "@/components/admin/AdminCart";

export const metadata: Metadata = {
  title: "Hurtigutdeling",
};

export default function RapidHandoutPage() {
  return (
    <Stack>
      <Title>Hurtigutdeling</Title>
      <AdminCart />
    </Stack>
  );
}
