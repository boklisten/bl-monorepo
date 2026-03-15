import AuthGuard from "@/features/auth/AuthGuard";
import CreateUsers from "@/features/user/CreateUsers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(administrasjon)/admin/database/lag_brukere")({
  head: () => ({
    meta: [{ title: "Lag brukere | bl-admin" }],
  }),
  component: CreateUsersPage,
});

function CreateUsersPage() {
  return (
    <AuthGuard requiredPermission={"admin"}>
      <CreateUsers />
    </AuthGuard>
  );
}
