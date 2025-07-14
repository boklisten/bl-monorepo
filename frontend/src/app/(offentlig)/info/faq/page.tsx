import { Container, Typography } from "@mui/material";
import { Metadata } from "next";

import QuestionsAndAnswersReadOnly from "@/components/info/questions-and-answers/QuestionsAndAnswersReadOnly";

export const metadata: Metadata = {
  title: "Spørsmål og svar",
  description:
    "Hva betyr det at Boklisten alltid leverer riktig bok? Hvordan bestiller jeg bøker som privatist?",
};

const FaqPage = () => {
  return (
    <Container>
      <Typography variant="h4" sx={{ textAlign: "center", marginBottom: 2 }}>
        Spørsmål og svar
      </Typography>
      <QuestionsAndAnswersReadOnly />
    </Container>
  );
};

export default FaqPage;
