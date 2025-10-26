import { Container, Stack, Text, Title } from "@mantine/core";

import classes from "@/features/frontpage/HeroImageBackground.module.css";
import OrderButton from "@/features/frontpage/OrderButton";

export function HeroImageBackground() {
  return (
    <div className={classes["welcome-display"]}>
      <Stack className={classes["inner"] ?? ""} align={"center"}>
        <Title className={classes["title"] ?? ""}>Alltid riktig bok! </Title>

        <Container size={640}>
          <Text
            size="lg"
            className={classes["description"] ?? ""}
            ta={"center"}
          >
            Vi i Boklisten.no er veldig opptatt av lærebøker, derfor vil vi
            gjøre det så enkelt som mulig for deg å få tak i dem.
          </Text>
        </Container>

        <OrderButton />
      </Stack>
    </div>
  );
}
