import { Skeleton, Stack, Title } from "@mantine/core";

export default function UserDetailEditorSkeleton({
  isSignUp,
}: {
  isSignUp?: boolean;
}) {
  return (
    <Stack>
      <Title ta={"center"}>
        {isSignUp ? "Registrer deg" : "Brukerinnstillinger"}
      </Title>
      <Skeleton height={60} />
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton height={60} key={`s-${index}`} />
      ))}
    </Stack>
  );
}
