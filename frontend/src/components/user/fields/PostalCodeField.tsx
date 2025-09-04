import { LocationOff } from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
import { CircularProgress, InputAdornment } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import isPostalCode from "validator/lib/isPostalCode";

import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailsEditor";
import unpack from "@/utils/bl-api-request";
import { publicApiClient } from "@/utils/publicApiClient";

type PostalCityState =
  | {
      city: string;
    }
  | { status: "empty" | "loading" | "error" | "invalid" };

async function lookupPostalCode(
  newPostalCode: string,
): Promise<PostalCityState> {
  if (!newPostalCode || !isPostalCode(newPostalCode, "NO")) {
    return { status: "invalid" };
  }

  try {
    const [{ postalCity: newPostalCity }] = await publicApiClient
      .$route("collection.deliveries.operation.postal-code-lookup.post")
      .$post({ postalCode: newPostalCode })
      .then(
        unpack<
          [
            {
              postalCity: string | null;
            },
          ]
        >,
      );

    if (!newPostalCity) {
      return { status: "invalid" };
    }

    return { city: newPostalCity };
  } catch (error) {
    console.error("Failed to get postal city for code", newPostalCode, error);
    return { status: "error" };
  }
}

const PostalCodeField = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<UserEditorFields>();
  return (
    <TextField
      required
      fullWidth
      id="postalCode"
      label="Postnummer"
      autoComplete="postal-code"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position={"end"}>
              <PostalCityStateStatusDisplay />
            </InputAdornment>
          ),
        },

        htmlInput: { inputMode: "numeric", pattern: "[0-9]{4}" },
      }}
      error={!!errors.postalCode}
      {...register("postalCode", {
        ...fieldValidators.postalCode,
      })}
    />
  );
};

const PostalCityStateStatusDisplay = () => {
  const {
    setValue,
    control,
    formState: { isSubmitted, touchedFields },
  } = useFormContext<UserEditorFields>();
  const postalCode = useWatch({ control, name: "postalCode" });
  const [postalCity, setPostalCity] = useState<PostalCityState>({
    status: "empty",
  });

  const shouldUpdate = touchedFields.postalCode || isSubmitted;

  useEffect(() => {
    async function updatePostalCity() {
      if (!postalCode && !shouldUpdate) {
        setPostalCity({ status: "empty" });
        return;
      }

      setPostalCity({ status: "loading" });
      const lookupResult = await lookupPostalCode(postalCode);
      setPostalCity(lookupResult);

      if ("city" in lookupResult) {
        setValue("postalCity", lookupResult.city);
      }
    }
    updatePostalCity();
  }, [postalCode, setValue, shouldUpdate]);

  if ("city" in postalCity) {
    return postalCity.city;
  }

  switch (postalCity.status) {
    case "empty":
      return "";
    case "loading":
      return <CircularProgress size="1.5rem" />;
    case "error":
      return <ErrorIcon />;
    case "invalid":
      return <LocationOff />;
  }
};

export default PostalCodeField;
