import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiClient from "@/shared/hooks/useApiClient";

export default function KustomCheckout({ orderId }: { orderId: string }) {
  const { api } = useApiClient();
  const { data } = useQuery(
    api.kustomCheckout.getSnippet.queryOptions({
      params: { orderId },
    }),
  );

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !data) return;

    el.innerHTML = data;

    Array.from(el.querySelectorAll("script")).forEach((original) => {
      const replacement = document.createElement("script");
      Array.from(original.attributes).forEach((attr) =>
        replacement.setAttribute(attr.name, attr.value),
      );
      replacement.textContent = original.textContent;
      original.parentNode?.replaceChild(replacement, original);
    });
  }, [data]);

  return <div ref={ref} />;
}
