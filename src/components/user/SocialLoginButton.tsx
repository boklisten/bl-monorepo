"use client";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

import { add } from "@/api/storage";
import BL_CONFIG from "@/utils/bl-config";

interface SocialLoginProps {
  label: string;
  brandName: "facebook" | "google";
  brandIcon: ReactNode;
  brandColor: string;
}

const SocialLoginButton = ({
  label,
  brandName,
  brandIcon,
  brandColor,
}: SocialLoginProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const caller = searchParams.get("caller");
  const redirect = searchParams.get("redirect");
  return (
    <Button
      onClick={() => {
        if (caller) {
          add(BL_CONFIG.login.localStorageKeys.caller, caller);
        }
        if (redirect) {
          add(BL_CONFIG.login.localStorageKeys.redirect, redirect);
        }
        router.push(BL_CONFIG.api.basePath + BL_CONFIG.login[brandName].url);
      }}
      data-testid={`${brandName}-button`}
      fullWidth
      variant="contained"
      sx={{
        mt: 1,
        padding: 2,
        background: brandColor,
        display: "flex",
        justifyContent: "left",
        textTransform: "none",
        "&:hover": {
          backgroundColor: brandColor,
          opacity: 0.9,
        },
      }}
      startIcon={
        <Box
          component="span"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& svg": {
              fontSize: 30,
            },
          }}
        >
          {brandIcon}
        </Box>
      }
      endIcon={<ChevronRightIcon />}
    >
      {label}
      <Box sx={{ flexGrow: 1 }}></Box>
    </Button>
  );
};

export default SocialLoginButton;
