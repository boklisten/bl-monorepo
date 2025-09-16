import { Metadata } from "next";

import MatchDetail from "@/features/matches/MatchDetail";

export const metadata: Metadata = {
  title: "Overlevering av bøker",
  description: "Overlevering av bøker",
};

const MatchDetailPage = async ({
  params,
}: PageProps<"/overleveringer/user/[userMatchId]">) => {
  const { userMatchId } = await params;
  return <MatchDetail userMatchId={userMatchId} />;
};

export default MatchDetailPage;
