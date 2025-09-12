import { Title } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/components/common/AuthGuard";
import MatchList from "@/components/matches/matchesList/MatchList";

export const metadata: Metadata = {
  title: "Mine overleveringer",
  description: "Overleveringer av bøker",
};

export default function MatchesPage() {
  return (
    <AuthGuard>
      <Title>Mine overleveringer</Title>
      <MatchList />
    </AuthGuard>
  );
}
