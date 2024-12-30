import BlFetcher from "@frontend/api/blFetcher";
import BuybackList from "@frontend/components/info/BuybackList";
import BL_CONFIG from "@frontend/utils/bl-config";
import { assertBlApiError } from "@frontend/utils/types";
import { Item } from "@shared/item/item";
import { Metadata } from "next";

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
