import { ComboboxItem, MultiSelect, MultiSelectProps } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { useFieldContext } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";

export default function SelectItemsField(props: MultiSelectProps) {
  const field = useFieldContext<{ id: string; title: string }[]>();
  const client = useApiClient();
  const { data: items } = useQuery({
    queryKey: [client.v2.items.$url()],
    queryFn: () => client.v2.items.$get().unwrap(),
  });

  return (
    <MultiSelect
      label={"Bøker"}
      placeholder={"Velg bøker"}
      searchable
      clearable
      description={"Søk etter tittel eller ISBN"}
      data={items?.map((item) => ({ label: item.title, value: item.id })) ?? []}
      filter={({ options, search }) => {
        return (options as ComboboxItem[]).filter((option) => {
          if (
            option.label
              .toLowerCase()
              .trim()
              .includes(search.toLowerCase().trim())
          )
            return true;
          const isbn = items
            ?.find((item) => item.id === option.value)
            ?.info.isbn.toString();
          return isbn?.includes(search.trim()) ?? false;
        });
      }}
      {...props}
      value={field.state.value.map((v) => v.id)}
      onChange={(values) =>
        field.handleChange(
          values.map((itemId) => ({
            id: itemId,
            title: items?.find((item) => item.id === itemId)?.title ?? "",
          })),
        )
      }
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
