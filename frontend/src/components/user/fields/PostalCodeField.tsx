import { LocationOff } from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
import {
  CircularProgress,
  InputAdornment,
  TextFieldProps,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { forwardRef, Ref, useRef, useState } from "react";
import isPostalCode from "validator/lib/isPostalCode";

import unpack from "@/utils/api/bl-api-request";
import { publicApiClient } from "@/utils/api/publicApiClient";

const PostalCodeField = forwardRef(
  (
    {
      postCity,
      updatePostalCity,
      onChange: updateForm,
      ...props
    }: PostalCodeFieldProps,
    ref: Ref<HTMLInputElement>,
  ) => {
    return (
      <TextField
        required
        fullWidth
        id="postalCode"
        label="Postnummer"
        autoComplete="postal-code"
        onChange={(event) => {
          updatePostalCity?.(event.currentTarget.value);
          updateForm?.(event);
        }}
        inputRef={ref}
        {...props}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position={"end"}>
                <PostalCityStateStatusDisplay postalCityStatus={postCity} />
              </InputAdornment>
            ),
          },

          htmlInput: { inputMode: "numeric", pattern: "[0-9]{4}" },
        }}
      />
    );
  },
);
PostalCodeField.displayName = "PostalCodeField";

export const usePostalCity = (
  initialPostCity: string | null,
  initialPostalCode: string | null,
): {
  postalCity: PostalCityState;
  updatePostalCity: (newPostalCode: string) => void;
  settlePostalCity: Promise<PostalCityStateSettled>;
} => {
  const [postalCity, setPostalCity] = useState<PostalCityState>(
    initialPostCity
      ? { state: "ok", city: initialPostCity }
      : {
          state: initialPostalCode ? "loading" : "invalid",
        },
  );
  const previousPostalCode = useRef(initialPostalCode);
  const lookupPromise = useRef<Promise<PostalCityStateSettled>>(
    Promise.resolve(
      initialPostCity
        ? { state: "ok", city: initialPostCity }
        : { state: "invalid" },
    ),
  );

  async function getNewStatus(
    newPostalCode: string,
  ): Promise<PostalCityStateSettled> {
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

  async function updatePostalCity(newPostalCode: string | null) {
    if (
      (postalCity.state === "ok" || postalCity.state === "invalid") &&
      previousPostalCode.current === newPostalCode
    ) {
      return;
    }

    previousPostalCode.current = newPostalCode;
    if (
      !newPostalCode ||
      newPostalCode.length !== 4 ||
      !isPostalCode(newPostalCode, "NO")
    ) {
      setPostalCity({ state: "invalid" });
      return;
    }

    setPostalCity({ state: "loading" });

    lookupPromise.current = getNewStatus(newPostalCode);
    const newStatus = await lookupPromise.current;
    setPostalCity(newStatus);
  }

  return {
    postalCity,
    updatePostalCity,
    //  fixme: for React compiler

    settlePostalCity: lookupPromise.current,
  };
};

export type PostalCityState =
  | PostalCityStateSettled
  | {
      state: "loading";
    };

interface PostalCityStateOk {
  state: "ok";
  city: string;
}
type PostalCityStateSettled =
  | PostalCityStateOk
  | { state: "error" | "invalid" };

type PostalCodeFieldProps = TextFieldProps & {
  postCity: PostalCityState;
  updatePostalCity?: (postalNumber: string) => void;
};

const PostalCityStateStatusDisplay = ({
  postalCityStatus,
}: {
  postalCityStatus: PostalCityState;
}) => {
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
