import { Accordion, Button, Stack, Table } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import useApiClient from "@/shared/hooks/useApiClient";

export default function EmailTemplateDropdown() {
  const client = useApiClient();
  const { data: emailTemplates } = useQuery({
    queryKey: [client.dispatch.email_templates.$url()],
    queryFn: () => client.dispatch.email_templates.$get().unwrap(),
  });

  return (
    <Accordion>
      <Accordion.Item value={"templates"}>
        <Accordion.Control>Tilgjengelige e-postmaler</Accordion.Control>
        <Accordion.Panel>
          <Stack align={"center"}>
            <Table
              data={{
                head: ["Navn", "ID"],
                body:
                  emailTemplates?.map((emailTemplate) => [
                    emailTemplate.name,
                    emailTemplate.id,
                  ]) ?? [],
              }}
            />
            <Button
              component={Link}
              href={"https://mc.sendgrid.com/dynamic-templates"}
              target={"_blank"}
              leftSection={<IconExternalLink />}
            >
              Administrer maler
            </Button>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
