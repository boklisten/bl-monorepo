import { Title, Stack } from "@mantine/core";
import { Metadata } from "next";

import QuestionsAndAnswersReadOnly from "@/features/questions-and-answers/QuestionsAndAnswersReadOnly";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export const metadata: Metadata = {
  title: "Spørsmål og svar",
  description:
    "Hva betyr det at Boklisten alltid leverer riktig bok? Hvordan bestiller jeg bøker som privatist?",
};

export default async function FaqPage() {
  "use cache";
  const cachedData = await publicApiClient.questions_and_answers
    .$get()
    .unwrap();

  return (
    <Stack>
      <Title ta={"center"}>Spørsmål og svar</Title>
      <QuestionsAndAnswersReadOnly cachedData={cachedData} />
    </Stack>
  );
}
