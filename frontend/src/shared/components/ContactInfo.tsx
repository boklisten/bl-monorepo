import { Center, Group, Stack, Text } from "@mantine/core";
import { IconLocation, IconMail, IconPhone } from "@tabler/icons-react";

import NextAnchor from "@/shared/components/NextAnchor";
import { CONTACT_INFO } from "@/shared/utils/constants";

const ContactInfo = () => {
  return (
    <Center>
      <Group gap={"xl"} justify={"center"}>
        <Group>
          <IconPhone />
          <Stack gap={2}>
            <Text>Ring oss</Text>
            <NextAnchor href={`tel:${CONTACT_INFO.phone}`}>
              {CONTACT_INFO.phone}
            </NextAnchor>
          </Stack>
        </Group>

        <Group>
          <IconMail />
          <Stack gap={2}>
            <Text>Send oss en e-post</Text>
            <NextAnchor href={`mailto:${CONTACT_INFO.email}`}>
              {CONTACT_INFO.email}
            </NextAnchor>
          </Stack>
        </Group>

        <Group>
          <IconLocation />
          <Stack gap={2}>
            <Text>Vår adresse</Text>
            <Group>
              <Text fs={"italic"}>{CONTACT_INFO.address}</Text>
            </Group>
          </Stack>
        </Group>
      </Group>
    </Center>
  );
};

export default ContactInfo;
