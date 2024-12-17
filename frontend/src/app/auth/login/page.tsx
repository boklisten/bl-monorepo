import { Card } from "@mui/material";
import { Metadata } from "next";
import { Suspense } from "react";

import SignIn from "@/components/user/SignIn";

export const metadata: Metadata = {
  title: "Logg inn",
  description:
    "Logg inn for bestille bøker, samt se status på nåvårende bøker.",
};

const LoginPage = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <Suspense>
          <SignIn />
        </Suspense>
      </Card>
    </>
  );
};

export default LoginPage;
