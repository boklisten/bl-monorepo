"use client";

import { DialogsProvider } from "@toolpad/core";
import { ReactNode } from "react";

export default function ToolpadProvider({ children }: { children: ReactNode }) {
  return <DialogsProvider>{children}</DialogsProvider>;
}
