import { Item } from "@boklisten/backend/shared/src/item/item";
import { Metadata } from "next";

import BlFetcher from "@/api/blFetcher";
import BuybackList from "@/components/info/BuybackList";
import BL_CONFIG from "@/utils/bl-config";
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
      `${BL_CONFIG.collection.item}?buyback=true&sort=title`,
    );
  } catch (error) {
    assertBlApiError(error);
  }

  return <BuybackList defaultBuybackItems={buybackItems} />;
};

export default BuybackPage;
