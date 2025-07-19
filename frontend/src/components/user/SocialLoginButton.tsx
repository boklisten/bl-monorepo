"use client";
import { SocialProvider } from "@boklisten/backend/app/services/types/user";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { ReactNode } from "react";

import useSocialLogin from "@/utils/useSocialLogin";

interface SocialLoginProps {
  label: string;
  provider: SocialProvider;
  brandIcon: ReactNode;
  brandColor: string;
}

const SocialLoginButton = ({
  label,
  provider,
  brandIcon,
  brandColor,
}: SocialLoginProps) => {
  const { redirectToLogin } = useSocialLogin();
  return (
    <Button
      onClick={() => redirectToLogin(provider)}
      fullWidth
      variant="contained"
      sx={{
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
