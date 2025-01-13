import MatchDetail from "@frontend/components/matches/MatchDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overlevering av bøker",
  description: "Overlevering av bøker",
};

const MatchDetailPage = async (props: {
  params: Promise<{ userMatchId: string }>;
}) => {
  const params = await props.params;
  return <MatchDetail userMatchId={params.userMatchId} />;
};

export default MatchDetailPage;
