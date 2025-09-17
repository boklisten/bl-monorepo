"use client"; // Error boundaries must be Client Components

import ErrorBoundary from "@/features/layout/ErrorBoundary";

export default function InfoPagesErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return <ErrorBoundary error={error} href={"/"} />;
}
