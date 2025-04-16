"use client";
import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Navigation, NavigationPageItem } from "@toolpad/core";

import DynamicLink from "@/components/DynamicLink";

export default function AdminNavigationCards({
  navLinks,
  rootPath,
  label,
}: {
  navLinks: Navigation;
  label: string;
  rootPath?: string;
}) {
  return (
    <>
      <Typography variant={"subtitle1"} sx={{ textAlign: "center", mb: 2 }}>
        {label}
      </Typography>
      <Grid container spacing={2} sx={{ justifyContent: "center" }}>
        {navLinks
          .filter(
            (navLink): navLink is NavigationPageItem => navLink.kind === "page",
          )
          .map((navLink) => (
            <Grid key={navLink.title}>
              <Card sx={{ width: 170 }}>
                <DynamicLink
                  href={`${rootPath ?? ""}/${navLink.segment ?? ""}`}
                  sx={{ color: "inherit" }}
                  underline={"none"}
                >
                  <CardActionArea>
                    <CardContent>
                      <Stack
                        sx={{ justifyContent: "center", alignItems: "center" }}
                      >
                        {navLink.icon}
                        <Typography>{navLink.title}</Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </DynamicLink>
              </Card>
            </Grid>
          ))}
      </Grid>
    </>
  );
}
