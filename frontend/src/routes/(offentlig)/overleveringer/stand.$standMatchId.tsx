import MatchDetail from "@/features/matches/MatchDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/overleveringer/stand/$standMatchId")({
  head: () => ({
    meta: [
      { title: "Overlevering av bøker | Boklisten.no" },
      {
        description: "Overleveringer av bøker",
      },
    ],
  }),
  component: MatchDetailPage,
});

function MatchDetailPage() {
  const { standMatchId } = Route.useParams();
  return <MatchDetail standMatchId={standMatchId} />;
}
