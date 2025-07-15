import { Container, Typography } from "@mui/material";
import { Metadata } from "next";

import QuestionsAndAnswersReadOnly from "@/components/info/questions-and-answers/QuestionsAndAnswersReadOnly";
import { publicApiClient } from "@/utils/api/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Spørsmål og svar",
  description:
    "Hva betyr det at Boklisten alltid leverer riktig bok? Hvordan bestiller jeg bøker som privatist?",
};

export default async function FaqPage() {
  const cachedData = await publicApiClient.questions_and_answers
    .$get()
    .unwrap();

  return (
    <Container>
      <Typography variant="h4" sx={{ textAlign: "center", marginBottom: 2 }}>
        Spørsmål og svar
      </Typography>
      <QuestionsAndAnswersReadOnly cachedData={cachedData} />
    </Container>
  );
}
