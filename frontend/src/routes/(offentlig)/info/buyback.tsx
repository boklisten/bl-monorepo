import BuybackList from "@/features/info/BuybackList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/info/buyback")({
  head: () => ({
    meta: [
      { title: "Innkjøpsliste | Boklisten.no" },
      {
        description:
          "Har du pensumbøker du ikke lenger har bruk for? Vi kjøper inn de aller fleste pensumbøker. Se oversikten over hvilke bøker vi tar imot her.",
      },
    ],
  }),
  component: BuybackPage,
});

function BuybackPage() {
  return <BuybackList />;
}
