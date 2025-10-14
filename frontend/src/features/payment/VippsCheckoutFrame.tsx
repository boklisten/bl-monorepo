"use client";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";
import { showErrorNotification } from "@/shared/utils/notifications";

export default function VippsCheckoutFrame() {
  const searchParams = useSearchParams();

  const checkoutFrontendUrl = searchParams.get("checkoutFrontendUrl");
  const token = searchParams.get("token");

  if (!checkoutFrontendUrl || !token)
    return (
      <ErrorAlert title={"Klarte ikke vise betalingsside"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );

  return (
    <>
      <Script
        src="https://checkout.vipps.no/vippsCheckoutSDK.js"
        onReady={() => {
          try {
            /* @ts-expect-error official Vipps Checkout */
            VippsCheckout({
              checkoutFrontendUrl,
              iFrameContainerId: "vipps-checkout-frame-container",
              language: "nb",
              token,
            });
          } catch (error) {
            showErrorNotification("Klarte ikke vise betalingsside");
            console.error(error);
          }
        }}
      />
      <section id="vipps-checkout-frame-container"></section>
    </>
  );
}
