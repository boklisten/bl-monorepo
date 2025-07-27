import { LocationOff } from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
import { CircularProgress, InputAdornment } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import isPostalCode from "validator/lib/isPostalCode";

import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailsEditor";
import unpack from "@/utils/api/bl-api-request";
import { publicApiClient } from "@/utils/api/publicApiClient";

type PostalCityState =
  | PostalCityStateSettled
  | {
      state: "loading";
    };

type PostalCityStateSettled =
  | {
      state: "ok";
      city: string;
    }
  | { state: "error" | "invalid" };

async function lookupPostalCode(
  newPostalCode: string,
): Promise<PostalCityStateSettled> {
  if (!isPostalCode(newPostalCode, "NO")) return { state: "invalid" };
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
      return { state: "invalid" };
    }

    return { state: "ok", city: newPostalCity };
  } catch (error) {
    console.error("Failed to get postal city for code", newPostalCode, error);
    return { state: "error" };
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
  const { watch, setError, setValue, clearErrors } =
    useFormContext<UserEditorFields>();
  const postalCode = watch("postalCode");
  const [postalCityStatus, setPostalCityStatus] = useState<PostalCityState>({
    state: "loading",
  });

  useEffect(() => {
    async function updatePostalCity() {
      const lookupResult = await lookupPostalCode(postalCode);
      setPostalCityStatus(lookupResult);

      if (lookupResult.state === "ok") {
        setValue("postalCity", lookupResult.city);
        clearErrors("postalCode");
      } else if (lookupResult.state === "invalid") {
        setError("postalCode", {
          message: "Du må oppgi et gyldig norsk postnummer",
        });
      } else {
        setError("postalCode", {
          message:
            "Noe gikk galt under sjekk av postnummer! Prøv igjen," +
            " eller ta kontakt dersom problemet vedvarer!",
        });
      }
    }
    updatePostalCity();
  }, [clearErrors, postalCode, setError, setValue]);

  switch (postalCityStatus.state) {
    case "ok": {
      return postalCityStatus.city;
    }
    case "loading": {
      return <CircularProgress size="1.5rem" />;
    }
    case "error": {
      return <ErrorIcon />;
    }
    case "invalid": {
      return <LocationOff />;
    }
  }
};

export default PostalCodeField;
