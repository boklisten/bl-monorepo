import { Divider, Stack, Title } from "@mantine/core";

import { withFieldGroup } from "@/hooks/form";

export interface UserInfoFieldValues {
  name: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  postalCity: string;
  birthday: string;
  guardian?: {
    name: string;
    email: string;
    phone: string;
  };
  branchMembership: string | undefined;
}

export const userInfoFieldDefaultValues: UserInfoFieldValues = {
  name: "",
  phoneNumber: "",
  address: "",
  postalCode: "",
  postalCity: "",
  birthday: "",
  branchMembership: undefined,
};
const UserInfoFields = withFieldGroup({
  defaultValues: userInfoFieldDefaultValues,
  props: {
    perspective: "personal",
  },
  render: function Render({ group, perspective }) {
    return (
      <>
        <Stack gap={3}>
          <Title order={4}>
            {perspective === "personal" ? "Din" : "Kundens"} informasjon
          </Title>
          <Divider />
        </Stack>
        <group.AppField name={"name"}>
          {(field) => <field.NameField />}
        </group.AppField>
        <group.AppField name={"phoneNumber"}>
          {(field) => <field.PhoneNumberField />}
        </group.AppField>
        <group.AppField name={"address"}>
          {(field) => <field.AddressField />}
        </group.AppField>
        <group.AppField name={"postalCode"}>
          {(field) => <field.PostalCodeField />}
        </group.AppField>
      </>
    );
  },
});
export default UserInfoFields;
