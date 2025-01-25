import { Card } from "@mui/material";
import { Metadata } from "next";
import { Suspense } from "react";

import UserDetailEditor from "@/components/user/user-detail-editor/UserDetailEditor";

export const metadata: Metadata = {
  title: "Ny bruker",
  description: "Opprett en ny bruker for å tilgang til å bestille skolebøker.",
};

const RegisterPage = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <Suspense>
          <UserDetailEditor isSignUp />
        </Suspense>
      </Card>
    </>
  );
};

export default RegisterPage;
