"use client";

import { DialogsProvider, NotificationsProvider } from "@toolpad/core";
import { ReactNode } from "react";

export default function ToolpadProvider({ children }: { children: ReactNode }) {
  return (
    <NotificationsProvider>
      <DialogsProvider>{children}</DialogsProvider>
    </NotificationsProvider>
  );
}
