import { Card } from "@mui/material";
import { Metadata } from "next";
import { Suspense } from "react";

import PersonalUserDetailEditor from "@/components/user/user-detail-editor/PersonalUserDetailEditor";

export const metadata: Metadata = {
  title: "Ny bruker",
  description: "Opprett en ny bruker for å tilgang til å bestille skolebøker.",
};

const RegisterPage = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <Suspense>
          <PersonalUserDetailEditor isSignUp />
        </Suspense>
      </Card>
    </>
  );
};

export default RegisterPage;
