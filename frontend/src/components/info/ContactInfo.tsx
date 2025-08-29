import { Anchor, Center, Group, Stack, Text } from "@mantine/core";
import { IconLocation, IconMail, IconPhone } from "@tabler/icons-react";
import Link from "next/link";

import { CONTACT_INFO } from "@/utils/constants";

const ContactInfo = () => {
  return (
    <Center>
      <Group gap={"xl"}>
        <Group>
          <IconPhone />
          <Stack gap={2}>
            <Text>Ring oss</Text>
            <Anchor component={Link} href={`tel:${CONTACT_INFO.phone}`}>
              {CONTACT_INFO.phone}
            </Anchor>
          </Stack>
        </Group>

        <Group>
          <IconMail />
          <Stack gap={2}>
            <Text>Send oss en e-post</Text>
            <Anchor component={Link} href={`mailto:${CONTACT_INFO.email}`}>
              {CONTACT_INFO.email}
            </Anchor>
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
