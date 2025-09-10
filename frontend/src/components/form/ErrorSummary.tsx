import ErrorAlert from "@/components/ui/ErrorAlert";
import { useFormContext } from "@/hooks/form";

export default function ErrorSummary({
  invalidText,
}: {
  invalidText?: string;
}) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.canSubmit}>
      {(canSubmit) =>
        canSubmit ? (
          <></>
        ) : (
          <ErrorAlert
            title={
              invalidText ??
              "Du må rette opp feilene ovenfor før du kan gå videre"
            }
          />
        )
      }
    </form.Subscribe>
  );
}
