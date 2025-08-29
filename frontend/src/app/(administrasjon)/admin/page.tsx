import { Text } from "@mantine/core";

export default function AdminStartPage() {
  return (
    <>
      <Text ta={"center"}>
        Velkommen til{" "}
        <Text
          span
          inherit
          variant={"gradient"}
          gradient={{ from: "yellow", to: "orange" }}
        >
          /admin
        </Text>
        ! Her finner du alle verktøyene du trenger for å dele ut og samle inn
        bøker
      </Text>
    </>
  );
}
