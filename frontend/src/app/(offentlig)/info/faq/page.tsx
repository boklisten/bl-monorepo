import { Title, Stack } from "@mantine/core";
import { Metadata } from "next";

import QuestionsAndAnswersReadOnly from "@/components/info/questions-and-answers/QuestionsAndAnswersReadOnly";
import { publicApiClient } from "@/utils/publicApiClient";

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
    <Stack>
      <Title ta={"center"}>Spørsmål og svar</Title>
      <QuestionsAndAnswersReadOnly cachedData={cachedData} />
    </Stack>
  );
}
