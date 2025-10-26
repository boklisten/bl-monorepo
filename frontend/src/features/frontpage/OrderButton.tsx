"use client";
import { Button } from "@mantine/core";
import Link from "next/link";

export default function OrderButton() {
  return (
    <Button
      size={"lg"}
      component={Link}
      href={"/bestilling"}
      variant="gradient"
      color={"brand"}
    >
      Bestill bøker
    </Button>
  );
}
