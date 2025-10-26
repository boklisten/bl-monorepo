import { Metadata } from "next";

import AppLayout from "@/app/AppLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | Boklisten.no",
    default: "Boklisten.no",
  },
};

export default function PublicPageLayout({ children }: LayoutProps<"/">) {
  return (
    <AppLayout padding={"md"} withBorder>
      {children}
    </AppLayout>
  );
}
