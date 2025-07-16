import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import {
  Autocomplete,
  Box,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import ScannerModal from "@/components/scanner/ScannerModal";
import UserDetailSearchResult from "@/components/search/UserDetailSearchResult";
import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

export default function UserDetailSearchField({
  onSelectedResult,
}: {
  onSelectedResult: (userDetail: UserDetail | null) => void;
}) {
  const client = useApiClient();
  const [searchValue, setSearchValue] = useState<UserDetail | null>(null);
  const [searchResults, setSearchResults] = useState<UserDetail[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ mt: 2, mb: 1, textAlign: "center" }}>
        Søk etter en kunde for å starte utdeling
      </Typography>
      <Autocomplete
        autoComplete
        value={searchValue}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        filterSelectedOptions
        getOptionLabel={(option) => option.name ?? option.email}
        getOptionKey={(option) => option.id}
        filterOptions={(x) => x}
        noOptionsText={null}
        onInputChange={async (event, newInputValue) => {
          if (event === null) return;
          if (newInputValue.length < 3) {
            onSelectedResult(null);
            setSearchValue(null);
            setSearchResults([]);
            return;
          }
          try {
            const result = await client
              .$route("collection.userdetails.getAll")
              .$get({
                query: { s: newInputValue },
              })
              .then(unpack<UserDetail[]>);
            setSearchResults(result);
          } catch {
            setSearchResults([]);
          }
        }}
        options={searchResults}
        renderOption={({ key }, userDetail) => (
          <UserDetailSearchResult
            key={key}
            userDetail={userDetail}
            onClick={() => {
              setSearchValue(userDetail);
              setSearchResults([userDetail]);
              onSelectedResult(userDetail);
            }}
          />
        )}
        renderInput={(params) => (
          // @ts-expect-error Using example from https://mui.com/material-ui/react-autocomplete/#system-FreeSolo.tsx
          <TextField
            {...params}
            label="Søk etter kunde"
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <IconButton onClick={() => setScannerOpen(true)}>
                    <QrCodeScannerIcon />
                  </IconButton>
                ),
                type: "search",
              },
            }}
          />
        )}
      />
      <ScannerModal
        onScan={async (scannedText) => {
          const [result] = await client
            .$route("collection.userdetails.getId", { id: scannedText })
            .$get()
            .then(unpack<[UserDetail]>);
          setScannerOpen(false);
          setSearchValue(result);
          onSelectedResult(result);
          return [{ feedback: "" }];
        }}
        open={scannerOpen}
        handleClose={() => setScannerOpen(false)}
        disableTypeChecks
      />
    </Box>
  );
}
