import { permanentRedirect } from "next/navigation";

export default function AdminRootPage() {
  return permanentRedirect("/admin/start");
}
