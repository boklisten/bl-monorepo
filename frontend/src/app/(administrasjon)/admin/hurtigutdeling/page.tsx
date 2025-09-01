import { Metadata } from "next";

import AdminCart from "@/components/admin/AdminCart";

export const metadata: Metadata = {
  title: "Hurtigutdeling",
};

export default function HandoutPage() {
  return <AdminCart />;
}
