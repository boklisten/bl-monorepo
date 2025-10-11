import { OrderItemType } from "#shared/order/order-item/order-item-type";
import { PaymentMethod } from "#shared/payment/payment-method/payment-method";

export const TranslationService = {
  translateOrderItemType(orderItemType: OrderItemType) {
    return {
      rent: "lån",
      return: "returnert",
      extend: "forlenget",
      cancel: "kansellert",
      buy: "kjøp",
      "partly-payment": "delbetaling",
      buyback: "tilbakekjøp",
      buyout: "utkjøp",
      sell: "solgt",
      loan: "utlånt",
      "invoice-paid": "betalt faktura",
      "match-receive": "mottatt fra elev",
      "match-deliver": "overlevert til elev",
    }[orderItemType];
  },
  translatePaymentMethod(paymentMethod: PaymentMethod) {
    return {
      dibs: "DIBS",
      cash: "kontanter",
      card: "kort",
      vipps: "Vipps",
      branch: "på filial",
      later: "betales senere",
      cashout: "betalt til kunde",
    }[paymentMethod];
  },
};
