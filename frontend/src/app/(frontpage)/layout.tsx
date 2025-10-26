import AppLayout from "@/app/AppLayout";

export default function FrontpageLayout({ children }: LayoutProps<"/">) {
  return (
    <AppLayout padding={0} withBorder={false}>
      {children}
    </AppLayout>
  );
}
