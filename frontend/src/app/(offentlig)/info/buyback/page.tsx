import { Item } from "@boklisten/backend/shared/item/item";
import { Metadata } from "next";

import BlFetcher from "@/api/blFetcher";
import BuybackList from "@/components/info/BuybackList";
import { publicApiClient } from "@/utils/api/publicApiClient";
import { assertBlApiError } from "@/utils/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Innkjøpsliste",
  description:
    "Har du pensumbøker du ikke lenger har bruk for? Vi kjøper inn de aller fleste pensumbøker. Se oversikten over hvilke bøker vi tar imot her.",
};

const BuybackPage = async () => {
  let buybackItems: Item[] = [];
  try {
    buybackItems = await BlFetcher.get<Item[]>(
      publicApiClient.$url("collection.items.getAll", {
        query: { buyback: true, sort: "title" },
      }),
    );
  } catch (error) {
    assertBlApiError(error);
  }

  return <BuybackList defaultBuybackItems={buybackItems} />;
};

export default BuybackPage;
