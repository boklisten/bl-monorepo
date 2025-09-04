import { Item } from "@boklisten/backend/shared/item";
import { Metadata } from "next";

import BuybackList from "@/components/info/BuybackList";
import unpack from "@/utils/bl-api-request";
import { publicApiClient } from "@/utils/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Innkjøpsliste",
  description:
    "Har du pensumbøker du ikke lenger har bruk for? Vi kjøper inn de aller fleste pensumbøker. Se oversikten over hvilke bøker vi tar imot her.",
};

export default async function BuybackPage() {
  const cachedBuybackItems = await publicApiClient
    .$route("collection.items.getAll")
    .$get({
      query: { buyback: true, sort: "title" },
    })
    .then(unpack<Item[]>);

  return <BuybackList cachedBuybackItems={cachedBuybackItems} />;
}
