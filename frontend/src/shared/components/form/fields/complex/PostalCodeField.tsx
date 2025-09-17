import { Loader, Text, TextInput } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import isPostalCode from "validator/lib/isPostalCode";

import { useFieldContext } from "@/shared/hooks/form";
import unpack from "@/shared/utils/bl-api-request";
import { showErrorNotification } from "@/shared/utils/notifications";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export async function postalCodeFieldValidator(value: string) {
  const illegalPostalCodeMessage = "Du må oppgi et gyldig norsk postnummer";
  if (!value || !isPostalCode(value, "NO")) return illegalPostalCodeMessage;

  const response = await publicApiClient
    .$route("collection.deliveries.operation.postal-code-lookup.post")
    .$post({ postalCode: value });

  const data = unpack<
    [
      {
        postalCity: string | null;
      },
    ]
  >(response);

  if (!data[0].postalCity) return illegalPostalCodeMessage;

  return null;
}

export default function PostalCodeField() {
  const field = useFieldContext<{ code: string; city: string }>();
  const { code, city } = field.state.value;

  const lookupPostalCodeMutation = useMutation({
    mutationFn: async () => {
      if (!isPostalCode(code, "NO")) return;
      const response = await publicApiClient
        .$route("collection.deliveries.operation.postal-code-lookup.post")
        .$post({ postalCode: code });
      const [{ postalCity: newPostalCity }] = unpack<
        [
          {
            postalCity: string | null;
          },
        ]
      >(response);

      return newPostalCity;
    },
    onSettled: (result) => field.setValue({ code, city: result ?? "" }),
    onError: () => showErrorNotification("Klarte ikke laste inn poststed"),
  });

  let postalCityHint = <></>;
  if (city) {
    postalCityHint = <Text size={"sm"}>{city}</Text>;
  } else if (lookupPostalCodeMutation.isPending) {
    postalCityHint = <Loader size={"xs"} />;
  }

  return (
    <TextInput
      required
      label={"Postnummer"}
      placeholder={"2560"}
      autoComplete={"postal-code"}
      inputMode={"numeric"}
      rightSectionWidth={city ? city.length * 10 : 30}
      rightSection={postalCityHint}
      value={code}
      onChange={async (event) => {
        field.setValue(
          { code: event.target.value, city: "" },
          { dontValidate: true },
        );
        lookupPostalCodeMutation.mutate();
      }}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
