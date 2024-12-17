import MatchDetail from "@frontend/components/matches/MatchDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overlevering av bøker",
  description: "Overlevering av bøker",
};

const MatchDetailPage = async (props: {
  params: Promise<{ matchId: string }>;
}) => {
  const params = await props.params;
  return <MatchDetail matchId={params.matchId} />;
};

export default MatchDetailPage;
