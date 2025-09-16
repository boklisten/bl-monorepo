import { Button, Card, Divider, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconHelp } from "@tabler/icons-react";
import Image from "next/image";

const ScannerTutorial = () => {
  return (
    <Button
      leftSection={<IconHelp />}
      onClick={() =>
        modals.open({
          title: "Hvordan scanne bøker",
          size: "lg",
          children: (
            <Stack>
              <Card withBorder>
                <Stack gap={"xs"}>
                  <Title order={4}>
                    1. Scan eller skriv inn en bok sin unike ID, som ser slik
                    ut:
                  </Title>
                  <Image
                    style={{ borderRadius: "2%" }}
                    src={"/ullernUID.png"}
                    alt={"Ullern VGS unik ID"}
                    width={300}
                    height={150}
                  />
                  <Divider label={"Eller"} />
                  <Image
                    style={{ borderRadius: "2%" }}
                    src={"/blid.jpg"}
                    alt={"BLID"}
                    width={300}
                    height={150}
                  />
                  <Text fs={"italic"}>
                    Sliter du med å finne IDen? Sjekk innsiden av boka, eller be
                    om hjelp fra kontaktelev eller stand
                  </Text>
                </Stack>
              </Card>

              <Card withBorder>
                <Title order={4}>
                  2. Gjenta til du har scannet alle bøkene du skal ha
                </Title>
              </Card>

              <Card withBorder>
                <Title order={4}>
                  3. VIKTIG: Sjekk at både du og den som ga deg bøkene har fått
                  det grønne merket{" "}
                </Title>
                <Image
                  style={{ borderRadius: "2%" }}
                  src={"/ok_check.png"}
                  alt={"OK Checkmark"}
                  width={300}
                  height={150}
                />
              </Card>
            </Stack>
          ),
        })
      }
    >
      Vis instruksjoner
    </Button>
  );
};

export default ScannerTutorial;
