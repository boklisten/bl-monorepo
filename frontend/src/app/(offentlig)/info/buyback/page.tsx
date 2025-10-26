import { Item } from "@boklisten/backend/shared/item";
import { Metadata } from "next";

import BuybackList from "@/features/info/BuybackList";
import unpack from "@/shared/utils/bl-api-request";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export const metadata: Metadata = {
  title: "Innkjøpsliste",
  description:
    "Har du pensumbøker du ikke lenger har bruk for? Vi kjøper inn de aller fleste pensumbøker. Se oversikten over hvilke bøker vi tar imot her.",
};

export default async function BuybackPage() {
  "use cache";
  const cachedBuybackItems = await publicApiClient
    .$route("collection.items.getAll")
    .$get({
      query: { buyback: true, sort: "title" },
    })
    .then(unpack<Item[]>);

  return <BuybackList cachedBuybackItems={cachedBuybackItems} />;
}
