"use client";
import { Phone } from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import {
  Alert,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import moment from "moment";
import { useState } from "react";

import { isLoggedIn } from "@/api/auth";
import BlFetcher from "@/api/blFetcher";
import DynamicLink from "@/components/DynamicLink";
import ScannerModal from "@/components/scanner/ScannerModal";
import useApiClient from "@/utils/api/useApiClient";
import useIsHydrated from "@/utils/useIsHydrated";

interface PublicBlidLookupResult {
  handoutBranch: string;
  handoutTime: string;
  deadline: string;
  title: string;
  isbn: number;
  name: string;
  email: string;
  phone: string;
}

export default function PublicBlidSearch() {
  const { client } = useApiClient();
  const hydrated = useIsHydrated();
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [blidSearch, setBlidSearch] = useState("");
  const [searchResult, setSearchResult] = useState<
    PublicBlidLookupResult | "inactive" | null
  >(null);

  async function onBlidSearch(blid: string) {
    setSearchResult(null);
    setScannerModalOpen(false);
    setBlidSearch(blid);
    if (blid.length !== 8 && blid.length !== 12) {
      // Only lookup for valid blids
      return;
    }
    try {
      const result = await BlFetcher.post<[PublicBlidLookupResult] | []>(
        client.$url(
          "collection.customeritems.operation.public-blid-lookup.post",
        ),
        {
          blid,
        },
      );
      if (result.length === 1) {
        setSearchResult(result[0]);
      } else {
        setSearchResult("inactive");
      }
    } catch (error) {
      console.error(error);
      setSearchResult("inactive");
    }
  }

  return (
    hydrated &&
    (isLoggedIn() ? (
      <Box
        component={"section"}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: "gray",
            fontSize: 14,
            mb: 1,
          }}
        >
          Skriv inn en bok sin unike ID (8 eller 12 siffer) for å se hvem den
          tilhører. Du kan også trykke på{" "}
          <QrCodeScannerIcon fontSize={"small"} sx={{ my: -0.7 }} /> for å
          scanne bokas unike ID med kamera.
        </Typography>
        <TextField
          label={"Unik ID"}
          value={blidSearch}
          onChange={(event) => onBlidSearch(event.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <Button onClick={() => setScannerModalOpen(true)}>
                  <QrCodeScannerIcon />
                </Button>
              ),
            },
          }}
        />
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: "gray",
            fontSize: 14,
            mb: 1,
          }}
        >
          {searchResult === "inactive" &&
            "Denne boken er ikke registrert som utdelt."}
          {((searchResult === null &&
            blidSearch.length !== 8 &&
            blidSearch.length !== 12) ||
            blidSearch.length === 0) &&
            "Venter på unik ID"}
        </Typography>
        {searchResult !== "inactive" && searchResult !== null && (
          <>
            <Typography
              variant={"h5"}
              sx={{
                textAlign: "center",
                mt: 0,
              }}
            >
              Denne boken tilhører
            </Typography>
            <Box
              sx={{
                padding: 2,
                border: "1px solid #ddd",
                borderRadius: 2,
                maxWidth: 500,
                margin: "0 auto",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  textAlign: "center",
                }}
              >
                {searchResult.name}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  mt: 2,
                  px: 5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone fontSize="small" sx={{ color: "primary.main" }} />
                  <Typography variant="body1">{searchResult.phone}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon fontSize="small" sx={{ color: "primary.main" }} />
                  <Typography variant="body1">{searchResult.email}</Typography>
                </Box>
              </Box>

              <Table sx={{ mt: 2 }}>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <b>Tittel</b>
                    </TableCell>
                    <TableCell>{searchResult.title}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>ISBN</b>
                    </TableCell>
                    <TableCell>{searchResult.isbn}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Utdelt hos</b>
                    </TableCell>
                    <TableCell>{searchResult.handoutBranch}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Utdelt den</b>
                    </TableCell>
                    <TableCell>
                      {moment(searchResult.handoutTime).format("DD/MM/YYYY")}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Frist</b>
                    </TableCell>
                    <TableCell>
                      {moment(searchResult.deadline).format("DD/MM/YYYY")}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </>
        )}
        <ScannerModal
          onScan={async (blid) => {
            onBlidSearch(blid);
            return [{ feedback: "" }] as [{ feedback: string }];
          }}
          open={scannerModalOpen}
          handleClose={() => setScannerModalOpen(false)}
        />
      </Box>
    ) : (
      <>
        <Alert severity="info">Du må logge inn for å kunne bruke boksøk</Alert>
        <DynamicLink href={"/auth/login?redirect=sjekk"}>
          <Button variant={"contained"} sx={{ mt: 2 }}>
            Logg inn
          </Button>
        </DynamicLink>
      </>
    ))
  );
}
