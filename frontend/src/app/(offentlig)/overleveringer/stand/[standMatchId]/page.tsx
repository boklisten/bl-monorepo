import { Metadata } from "next";

import MatchDetail from "@/features/matches/MatchDetail";

export const metadata: Metadata = {
  title: "Overlevering av bøker",
  description: "Overlevering av bøker",
};

const MatchDetailPage = async ({
  params,
}: PageProps<"/overleveringer/stand/[standMatchId]">) => {
  const { standMatchId } = await params;
  return <MatchDetail standMatchId={standMatchId} />;
};

export default MatchDetailPage;
