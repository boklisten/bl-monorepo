import { Metadata } from "next";

import AuthGuard from "@/features/auth/AuthGuard";
import CreateUsers from "@/features/user/CreateUsers";

export const metadata: Metadata = {
  title: "Lag brukere",
};

export default function CreateUsersPage() {
  return (
    <AuthGuard requiredPermission={"admin"}>
      <CreateUsers />
    </AuthGuard>
  );
}
